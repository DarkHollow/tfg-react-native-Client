import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  StatusBar,
  Platform,
  TouchableNativeFeedback,
  TextInput,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Button,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import TvShowButton from './components/tvShowButton';

/* Constantes */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';

const InitialNavBarElementsOpacity = 1;
const InitialSearchMarginRight = 50;
const InitialSearchHeight = 30;
const InitialSearchWidth = 170;
const InitialSearchBorderRadius = 3;

class Root extends Component {

  constructor() {
    super();
    this.state = {
      navBarElementsOpacity: new Animated.Value(InitialNavBarElementsOpacity),
      searchMarginRight: new Animated.Value(InitialSearchMarginRight),
      searchHeight: new Animated.Value(InitialSearchHeight),
      searchWidth: new Animated.Value(InitialSearchWidth),
      searchBorderRadius: new Animated.Value(InitialSearchBorderRadius),
      modalVisible: false,
      popularFetchEnded: false,
      popularData: {},
      topRatedFetchEnded: false,
      topRatedData: {},
      refreshing: false,
      popularRefreshed: false,
      topRatedRefreshed: false,
    }
  }

  componentWillMount() {
    this.getUserDataAndFetch();
  }

  navigateTo(route, reset) {
    this.props.navigator.push({
      name: route, reset: reset
    });
  }

  /* redirige a la vista de ficha de tv show */
  openTvShow(tvShowId) {
    console.log('Ver TV Show con id:' + tvShowId);
    this.props.navigator.push({
      name: 'tvshow',
      passProps: {
        tvShowId: tvShowId,
        backButtonText: 'popularTvShows'
      }
    });
  }

  // obtener datos usuario
  async getUserDataAndFetch() {
    await AsyncStorage.multiGet(['userId', 'userName', 'jwt']).then((userData) => {
      this.setState({
        userId: userData[0][1],
        userName: userData[1][1],
        jwt: userData[2][1]
      });
      this.getPopular();
      this.getTopRated();
    });
  }

  async logout() {
    console.log("logout");
    try {
      await AsyncStorage.multiRemove(['jwt', 'userId', 'userName']).then(() => {
        console.log('Storage sesión eliminada');
      }).done();
      // token borrado, navegamos a login
      this.navigateTo('login', true);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  onDoLogout() {
    this.dismissModal();
    this.logout().done();
  }

  onLogoutPress() {
    this.showButtonsModal('Cerrar sesión', '¿Seguro que quieres cerrar sesión?', 'log-out');
  }

  // mostrar u ocultar modal: mostrar/ocultar, titulo, mensaje, mostrar/ocultar spinner
  setModalVisible(visible, title, message, loading, buttons) {
    this.setState({modalTitle: title});
    this.setState({modalMessage: message});
    this.setState({modalLoading: loading});
    this.setState({modalButtons: buttons});
    this.setState({modalVisible: visible});
  }

  showAndHideModal(visible, title, message, loading) {
    this.setModalVisible(visible, title, message, loading);
    setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
  }

  showButtonsModal(title, message, buttons) {
    this.setModalVisible(true, title, message, null, buttons)
  }

  dismissModal() {
    this.setModalVisible(false, '', '', false, null);
  }

  onSearchFocus() {
    const {height, width} = Dimensions.get('window');

    Animated.parallel([
      Animated.timing(this.state.navBarElementsOpacity, {
        toValue: 0,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchMarginRight, {
        toValue: 0,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchHeight, {
        toValue: 56,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchWidth, {
        toValue: width,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchBorderRadius, {
        toValue: 0,
        easing: Easing.bouce,
        duration: 200
      })
    ]).start( () => {
      this.navigateTo('search', false);

      setTimeout(() => {
        this.setState({
          navBarElementsOpacity: new Animated.Value(InitialNavBarElementsOpacity),
          searchMarginRight: new Animated.Value(InitialSearchMarginRight),
          searchHeight: new Animated.Value(InitialSearchHeight),
          searchWidth: new Animated.Value(InitialSearchWidth),
          searchBorderRadius: new Animated.Value(InitialSearchBorderRadius),
        });
      }, 500);
    });
  }

  getPopular() {
    console.log('obtener series populares');
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/tvshows/popular' : 'http://192.168.1.13:9000/api/tvshows/popular';

    // hacemos fetch a la API
    fetch(URL, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + this.state.jwt,
      }
    }).then((response) => response.json())
      .then((responseData) => {
        // procesamos datos
        this.processPopularData(responseData);
      }).then( () => {
      // indicamos que fetch ha terminado
      this.setState({popularFetchEnded: true});
    }).catch((error) => {
      console.log(error.stack);
      this.showAndHideModal(true, 'Error', 'No se han podido cargar los datos de las series populares', false);
    });
  }

  processPopularData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error) {
      if (data.error === 'Not found') {
        // no hay series populares
      } else {
        // otro tipo de error interno
      }
      // mostramos error y volvemos atrás
      console.log(data);
      this.showAndHideModal(true, 'Error', 'No se han podido cargar los datos de las series populares', false);
    } else {
      // cargamos datos en el state
      this.setState({popularData: data});
    }
  }

  getTopRated() {
    console.log('obtener series mejor valoradas');
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/tvshows/toprated' : 'http://192.168.1.13:9000/api/tvshows/toprated';

    // hacemos fetch a la API
    fetch(URL, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + this.state.jwt,
      }
    }).then((response) => response.json())
      .then((responseData) => {
        // procesamos datos
        this.processTopRatedData(responseData);
      }).then( () => {
      // indicamos que fetch ha terminado
      this.setState({topRatedFetchEnded: true});
    }).catch((error) => {
      console.log(error.stack);
      this.showAndHideModal(true, 'Error', 'No se han podido cargar los datos de las series mejor valoradas', false);
    });
  }

  processTopRatedData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error) {
      if (data.error === 'Not found') {
        // no hay series populares
      } else {
        // otro tipo de error interno
      }
      // mostramos error y volvemos atrás
      console.log(data);
      this.showAndHideModal(true, 'Error', 'No se han podido cargar los datos de las series mejor valoradas', false);
    } else {
      // cargamos datos en el state
      this.setState({topRatedData: data});
    }
  }

  render() {
    // definición de los botones de los Modal

    // botones del Modal
    let modalButtons = null;
    if (this.state.modalButtons !== null && this.state.modalButtons !== undefined) {
      modalButtons = [];
      switch (this.state.modalButtons) {
        case 'log-out':
          modalButtons.push(
            (Platform.OS === 'ios') ? (
              <View style={styles.modalBottomButtonView} key={1}>
                <Button
                  onPress={ this.onDoLogout.bind(this) }
                  title={'Sí'.toUpperCase()}
                  color={'rgba(255,149,0,1)'}
                />
              </View>
            ) : (
              <View style={styles.modalBottomButtonView} key={1}>
                <TouchableNativeFeedback
                  onPress={ this.onDoLogout.bind(this) }
                  background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                  <View style={styles.modalBottomButton}>
                    <Text style={styles.modalBottomButtonText}>{'Sí'.toUpperCase()}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            )
          );
          modalButtons.push(
            (Platform.OS === 'ios') ? (
              <View style={styles.modalBottomButtonView} key={2}>
                <Button
                  onPress={ this.dismissModal.bind(this) }
                  title={'Cancelar'.toUpperCase()}
                  color={'rgba(255,149,0,1)'}
                  bold
                />
              </View>
            ) : (
              <View style={styles.modalBottomButtonView} key={2}>
                <TouchableNativeFeedback
                  onPress={ this.dismissModal.bind(this) }
                  background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                  <View style={styles.modalBottomButton}>
                    <Text style={styles.modalBottomButtonText}>{'Cancelar'.toUpperCase()}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            )
          );
          break;
        default:
      }
    }

    return (
      <View style={styles.nav}>
        <StatusBar
          animated
          translucent
          barStyle="light-content"
          backgroundColor={'transparent'}
          hidden
        />
        <CustomComponents.Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
        />
        <Modal
          animationType={'fade'}
          transparent
          onRequestClose={() => {}}
          visible={this.state.modalVisible}
        >
          <View style={styles.modal}>
            <View style={styles.innerModal}>
              <Text style={styles.modalTitle}>{this.state.modalTitle}</Text>
              <Text style={styles.modalMessage}>{this.state.modalMessage}</Text>
              {(this.state.modalLoading || this.state.modalButtons !== null) ? (
                <View style={styles.modalBottom}>
                  <View style={styles.modalBottomTopBorder} />
                  {(this.state.modalLoading) ? (
                    <ActivityIndicator style={styles.modalLoader}
                                       size={'small'} color={'rgba(255,149,0,1)'} />
                  ) : (
                    <View style={{flexDirection: 'row'}}>
                      { modalButtons }
                    </View>
                  )}

                </View>
              ) : ( null )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  keyExtractor = (item, index) => index;

  renderPopularItem = ({item, index}) => (
    <TvShowButton
      onPress={ this.openTvShow.bind(this, item.id) }
      width={(Platform.OS === 'ios') ? 130 : 130}
      imageWidth={(Platform.OS === 'ios') ? 130 : 130}
      imageHeight={(Platform.OS === 'ios') ? 191 : 191}
      backgroundColor={'#212121'}
      opacityColor={'rgba(255,149,0,1)'}
      useForeground
      source={item.poster !== null && item.poster !== undefined ? {uri: (URLSERVER + item.poster.substring(2))} : require('./img/placeholderPoster.png')}
      title={ item.name}
      titleSize={(Platform.OS === 'ios') ? 13 : 14}
      titleColor={'rgba(255,255,255,0.86)'}
      subtitleLeft={'#' + (index+1)}
      subtitleRight={ item.trend > 0 ? '▲ ' + item.trend : item.trend === 0 ? '--' : '▼ ' + item.trend}
      subtitleSize={(Platform.OS === 'ios') ? 13 : 14}
      subtitleLeftColor={'rgba(255,255,255,0.86)'}
      subtitleRightColor={item.trend > 0 ? 'rgba(0,230,0,0.56)' + item.trend : item.trend === 0 ? 'rgba(0,230,0,0.56)' : '#ba2c20'}
      resizeMode={'cover'}
    />
  );

  renderTopRatedItem = ({item, index}) => (
    <TvShowButton
      onPress={ this.openTvShow.bind(this, item.id) }
      width={(Platform.OS === 'ios') ? 130 : 130}
      imageWidth={(Platform.OS === 'ios') ? 130 : 130}
      imageHeight={(Platform.OS === 'ios') ? 191 : 191}
      backgroundColor={'#212121'}
      opacityColor={'rgba(255,149,0,1)'}
      useForeground
      source={item.poster !== null && item.poster !== undefined ? {uri: (URLSERVER + item.poster.substring(2))} : require('./img/placeholderPoster.png')}
      title={ item.name}
      titleSize={(Platform.OS === 'ios') ? 13 : 14}
      titleColor={'rgba(255,255,255,0.86)'}
      subtitleLeft={<Text> <Icon style={styles.scoreAvgStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} /> <Text style={styles.textIconStar}>{item.score}</Text></Text>}
      subtitleRight={'(' + item.voteCount +')'}
      subtitleLeftSize={(Platform.OS === 'ios') ? 12 : 13}
      subtitleLeftColor={'rgba(255,255,255,0.86)'}
      subtitleRightColor={'rgba(255,255,255,0.56)'}
      resizeMode={'cover'}
    />
  );

  renderScene(route, navigator) {

    let { navBarElementsOpacity, searchHeight, searchWidth, searchMarginRight, searchBorderRadius } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.navBarView}>
          <Animated.Text style={[styles.navBarTitle, {opacity: navBarElementsOpacity}]}>Principal</Animated.Text>
          <Animated.View style={[styles.searchView,
            {height: searchHeight, width: searchWidth, right: searchMarginRight, borderRadius: searchBorderRadius}
          ]}>
            <Icon style={styles.searchIcon}
                  name={(Platform.OS === 'ios') ? 'ios-search-outline' : 'md-search'} />
            <TextInput
              placeholder='Buscar serie'
              placeholderTextColor={'rgba(255,255,255,0.4)'}
              style={styles.inputSearch}
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              onFocus={ this.onSearchFocus.bind(this, 'search', false) }
            />
          </Animated.View>
          {(Platform.OS === 'ios') ?
            <Animated.View style={[styles.accountButtonView, {opacity: navBarElementsOpacity}]}>
              <TouchableHighlight onPress={ this.onLogoutPress.bind(this) } underlayColor={'rgba(255,179,0,1)'}>
                <Icon style={styles.accountButtonIcon} name={'ios-log-out'} />
              </TouchableHighlight>
            </Animated.View>
            :
            <Animated.View style={[styles.accountButtonView, {opacity: navBarElementsOpacity}]}>
              <TouchableNativeFeedback
                onPress={ this.onLogoutPress.bind(this) }
                delayPressIn={0}
                background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                <View>
                  <Icon style={styles.accountButtonIcon} name={'md-log-out'} />
                </View>
              </TouchableNativeFeedback>
            </Animated.View>
          }
        </View>

        <ScrollView style={styles.scrollViewV}
                    scrollEventThrottle={16}>
          <View style={styles.sections}>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Más populares</Text>
                <Text style={styles.sectionButton} onPress={this.navigateTo.bind(this, 'popularTvShows', false)}>Ver todo</Text>
              </View>
              <View style={styles.sectionContent}>
                {(this.state.popularFetchEnded ?
                  (this.state.popularData.size > 0) ? (
                    <FlatList horizontal style={styles.scrollH} contentContainerStyle={styles.scrollHcontent}
                              data={this.state.popularData.tvShows}
                              renderItem={this.renderPopularItem.bind(this)}
                              keyExtractor={this.keyExtractor.bind(this)}
                              extraData={this.state.popularData}
                    />
                  ) : (
                    null
                  ) : (
                    <ActivityIndicator style={styles.modalLoader}
                                       size={'small'} color={'rgba(255,149,0,1)'} />
                  ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mejor valoradas</Text>
                <Text style={styles.sectionButton} onPress={this.navigateTo.bind(this, 'mostRatedTvShows', false)}>Ver todo</Text>
              </View>
              <View style={styles.sectionContent}>
                {(this.state.topRatedFetchEnded ?
                  (this.state.topRatedData.size > 0) ? (
                    <FlatList horizontal style={styles.scrollH} contentContainerStyle={styles.scrollHcontent}
                              data={this.state.topRatedData.tvShows}
                              renderItem={this.renderTopRatedItem.bind(this)}
                              keyExtractor={this.keyExtractor.bind(this)}
                              extraData={this.state.topRatedData}
                    />
                  ) : (
                    null
                  ) : (
                    <ActivityIndicator style={styles.modalLoader}
                                       size={'small'} color={'rgba(255,149,0,1)'} />
                  ))}
              </View>
            </View>
          </View>
        </ScrollView>

      </View>
    )
  }

}

const styles = StyleSheet.create({
  nav: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  navBarView: {
    position: 'relative',
    zIndex: 1,
    height: 56,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    backgroundColor: '#1f1f1f',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: { width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  navBarTitle: {
    paddingLeft: 14,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium'
      },
    }),
  },
  searchView: {
    flexDirection: 'row',
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  searchIcon: {
    position: 'absolute',
    alignSelf: 'center',
    paddingLeft: 14,
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  inputSearch: {
    flex: 1,
    margin: 0,
    padding: 0,
    paddingLeft: 46,
    color: 'white',
    paddingTop: 0,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
      },
    }),
  },
  accountButtonView: {
    position: 'absolute',
    right: 6,
    borderRadius: 100,
    ...Platform.select({
      android: {
        right: 10,
      },
    }),
  },
  accountButtonIcon: {
    fontSize: 26,
    color: 'rgba(255,255,255,0.76)',
    padding: 4,
    paddingLeft: 7,
    paddingRight: 7,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
        fontSize: 20,
      },
    }),
  },
  modal: {
    flex: 1,
    padding: 50,
    backgroundColor: 'rgba(23,23,23,0.9)',
    justifyContent: 'center',
  },
  innerModal: {
    paddingTop: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: { width: 0, height: 0},
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      }
    }),
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    marginBottom: 3,
  },
  modalMessage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    paddingHorizontal: 20,
    paddingBottom: 20,
    textAlign: 'center',
  },
  modalBottom: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    ...Platform.select({
      ios: {
        paddingLeft: 10,
        paddingRight: 10,
      },
    }),
  },
  modalBottomTopBorder: {
    borderTopWidth: 1,
    borderColor: 'rgba(245,245,245,0.05)',
    alignSelf: 'stretch'
  },
  modalLoader: {
    marginTop: 10,
    paddingBottom: 10,
  },
  modalBottomButtonView: {
    flex: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  modalBottomButton: {
    padding: 10,
    alignSelf: 'stretch',
  },
  modalBottomButtonText: {
    alignSelf: 'center',
    color: 'rgba(255,149,0,1)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    fontSize: 14,
  },
  scrollViewV: {
    flex: 1,
    position: 'relative',
    zIndex: -2,
    alignSelf: 'stretch',
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    padding: 14,
    paddingBottom: 10,
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium'
      },
      ios: {
        fontWeight: '600',
      },
    }),
  },
  sectionButton: {
    backgroundColor: 'transparent',
    fontSize: 13,
    alignSelf: 'flex-end',
    color: 'rgba(255,149,0,1)',
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  sectionContent: {

  },
  scrollH: {

  },
  scrollHcontent: {
    paddingLeft: 14,
    paddingRight: 14,
  },
  scoreAvgStar: {
    fontSize: 16,
    color: 'rgba(255,204,0,1)',
  },
});

export default Root;

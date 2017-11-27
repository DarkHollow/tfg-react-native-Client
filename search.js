import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableOpacity,
  ActivityIndicator,
  ListView,
  Image,
  Animated,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  AsyncStorage,
  Dimensions,
  TextInput,
  Easing,
  Button,
  Modal,
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';

/* Constantes de URLs */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';

const {height, width} = Dimensions.get('window');

const InitialNavBarElementsOpacity = 0;
const InitialSearchMarginRight = 0;
const InitialSearchHeight = 56;
const InitialSearchWidth = width;
const InitialSearchBorderRadius = 0;

class Search extends Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      userId: 0,
      userName: '',
      jwt: '',
      searchText: '',
      searchedText: '',
      showProgress: false,
      showListView: false,
      showNotFound: false,
      dataSource: ds.cloneWithRows([]),
      listviewOpacity: new Animated.Value(0),
      notFoundOpacity: new Animated.Value(0),
      navBarElementsOpacity: new Animated.Value(InitialNavBarElementsOpacity),
      searchMarginRight: new Animated.Value(InitialSearchMarginRight),
      searchHeight: new Animated.Value(InitialSearchHeight),
      searchWidth: new Animated.Value(InitialSearchWidth),
      searchBorderRadius: new Animated.Value(InitialSearchBorderRadius),
      modalVisible: false,
    }
  }

  // obtener datos usuario
  async getUserData() {
    await AsyncStorage.multiGet(['userId', 'userName', 'jwt']).then((userData) => {
      this.setState({
        userId: userData[0][1],
        userName: userData[1][1],
        jwt: userData[2][1]
      });
    });
  }

  componentWillMount() {
    this.getUserData();
  }

  // mostrar u ocultar modal: mostrar/ocultar, titulo, mensaje, mostrar/ocultar spinner
  setModalVisible(visible, title, message, loading, buttons) {
    this.setState({modalTitle: title});
    this.setState({modalMessage: message});
    this.setState({modalLoading: loading});
    this.setState({modalButtons: buttons});
    this.setState({modalVisible: visible});
  }

  showAndHideModal(title, message, loading) {
    this.setModalVisible(true, title, message, loading, null);
    setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
  }

  /* submit buscar */
  onSubmit() {
    console.log('Buscar ' + this.state.searchText);

    //this.showButtonsModal('Cerrar sesión', '¿Seguro que quieres cerrar sesión?', 'sign-out');

    this.setState({showProgress: true});
    this.notFoundAnimationHide(0);
    this.listviewAnimationHide(0);

    // comprobar longitud de query
    if (this.state.searchText.length >= 3) {
      // guardamos el termino buscado
      this.setState({searchedText: this.state.searchText});

      // hacemos fetch a la API
      fetch(URLSERVER + 'api/tvshows?search=' + this.state.searchText, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.jwt,
        }
      }).then((response) => response.json())
        .then((responseData) => {
          this.processData(responseData);
        }).then( () => {
        // ocultamos spinner
        this.setState({showProgress: false});
      }).then( () => {
        // ocultamos teclado
        Keyboard.dismiss();
      }).catch((error) => {
        console.log(error.stack);
        this.setState({showProgress: false});
        this.showAndHideModal('Error', 'Lamentablemente no se ha podido realizar la búsqueda', false);
      });
    } else {
      this.setState({showProgress: false});
      this.showAndHideModal('Buscar', 'Introduce como mínimo 3 caracteres', false);
    }
  }

  /* procesamos los datos que nos devuelve la API */
  processData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error) {
      if (data.error === 'Not found') {
        // no se han encontrado resultados con esa query
        this.notFoundAnimationShow(0);
      } else if (data.error === 'Bad request') {
        // error bad request por introducir menos de 3 caracteres
        this.showAndHideModal('Buscar', 'Introduce como mínimo 3 caracteres', false);
      } else {
        // otro tipo de error interno
        this.showAndHideModal('Error', 'Lamentablemente no se ha podido realizar la búsqueda', false);
      }
    } else {
      // cargamos datos en el datasource
      this.setState({dataSource: this.state.dataSource.cloneWithRows(data)});
      this.listviewAnimationShow(0);
    }
  }

  // process image uri
  formatImageUri(uri) {
    result = uri;

    if (uri !== null && uri !== undefined) {
      if (uri.length > 2) {
        result = URLSERVER + uri.substring(2);
      }
    }
    return result;
  }

  /* redirige a la vista de ficha de tv show */
  openTvShow(tvShowId) {
    console.log('Ver TV Show con id:' + tvShowId);
    this.props.navigator.push({
      name: 'tvshow',
      passProps: {
        tvShowId: tvShowId,
        backButtonText: 'Búsqueda'
      }
    });
  }

  /* animaciones */

  onBackPress(navigator) {
    Animated.parallel([
      Animated.timing(this.state.navBarElementsOpacity, {
        toValue: 1,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchMarginRight, {
        toValue: 50,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchHeight, {
        toValue: 30,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchWidth, {
        toValue: 170,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchBorderRadius, {
        toValue: 3,
        easing: Easing.bouce,
        duration: 200
      })
    ]).start( () => {
      navigator.parentNavigator.pop();
    });
  }

  notFoundAnimationShow(delay) {
    setTimeout( () => {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows([]),
        showNotFound: true,
      });
      Animated.timing(this.state.notFoundOpacity, {
        toValue: 1,
        delay: delay,
        duration: 250
      }).start();
    }, 110);
  }

  notFoundAnimationHide(delay) {
    Animated.timing(this.state.notFoundOpacity, {
      toValue: 0,
      delay: delay,
      duration: 100
    }).start( () => {
      this.setState({showNotFound: false});
    });
  }

  listviewAnimationShow(delay) {
    setTimeout( ()=> {
      this.setState({showListView: true});
      Animated.timing(this.state.listviewOpacity, {
        toValue: 1,
        delay: delay,
        duration: 250
      }).start();
    }, 110);
  }

  listviewAnimationHide(delay) {
    Animated.timing(this.state.listviewOpacity, {
      toValue: 0,
      delay: delay,
      duration: 100
    }).start( () => {
      this.setState({showListView: false});
    });
  }

  /* navegar a vista de solicitar nueva serie */
  navigateToRequestTvShow() {
    console.log('Navegar a solicitar nueva serie');
    this.props.navigator.push({
      name: 'requestTvShow',
      passProps: {
        searchText: this.state.searchText
      }
    });
  }

  /* cabecera del listview: mostrar cuántos resultados se han obtenido */
  renderHeader() {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderLeft}>Resultados de "{this.state.searchedText}"</Text>
        <Text style={styles.listHeaderRight}>{this.state.dataSource.getSectionLengths()}</Text>
      </View>
    );
  }

  /* contenido de cada elemento del listview */
  renderRow(rowData) {
    return (
      (Platform.OS === 'ios') ? (
        <TouchableOpacity style={styles.rowTouch} onPress={ this.openTvShow.bind(this, rowData.id) }>
          <View style={styles.row}>
            <View style={styles.rowTop}>
              <Image style={styles.rowImage}
                     source={ rowData.banner !== null ? {uri: this.formatImageUri(rowData.banner)} : require('./img/placeholderBanner.png')}
              />
            </View>
            <View style={styles.rowBottom}>
              <View style={styles.rowBottomLeft}>
                <Text style={styles.rowTitle}>{rowData.name}</Text>
                <Text style={styles.rowSubtitle}>Año
                  {' ' + new Date(rowData.firstAired).getFullYear()}
                </Text>
              </View>
              <View style={styles.rowBottomRight}>
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>{(rowData.voteCount === 0) ? 'Sin votos' : rowData.score}</Text>
                  <Icon name='ios-star' style={styles.ratingIcon} />
                  <Icon name='ios-arrow-forward' style={styles.forwardIcon} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.rowTouch} onPress={ this.openTvShow.bind(this, rowData.id) }>
          <TouchableNativeFeedback
            onPress={ () => this.openTvShow(rowData.id) }
            background={TouchableNativeFeedback.Ripple('rgba(255,149,0,1)', true)}
            useForeground>
            <View style={styles.row}>
              <View style={styles.rowTop}>
                <Image style={styles.rowImage}
                       source={ rowData.banner !== null ? {uri: this.formatImageUri(rowData.banner)} : require('./img/placeholderBanner.png')}
                />
              </View>
              <View style={styles.rowBottom}>
                <View style={styles.rowBottomLeft}>
                  <Text style={styles.rowTitle}>{rowData.name}</Text>
                  <Text style={styles.rowSubtitle}>Año
                    {' ' + new Date(rowData.firstAired).getFullYear()}
                  </Text>
                </View>
                <View style={styles.rowBottomRight}>
                  <View style={styles.rating}>
                    <Text style={styles.ratingText}>{(rowData.voteCount === 0) ? 'Sin votos' : rowData.score}</Text>
                    <Icon name='md-star' style={styles.ratingIcon} />
                  </View>
                </View>
              </View>
            </View>
          </TouchableNativeFeedback>
        </View>
      )
    );
  }

  /* pie de la listview para hacer padding en Android por navbar transparente */
  renderFooter() {
    return (
      <View style={styles.separatorView}>
        <View style={styles.solicitarSerie}>
          <Text style={styles.solicitarSerieQuestion}>¿No encuentras lo que buscas?</Text>
          <View style={styles.solicitarSerieButtonView}>
            {(Platform.OS === 'ios') ? (
              <Button
                onPress={() => { this.navigateToRequestTvShow() }}
                title={'Solicitar nueva serie'.toUpperCase()}
                color={'rgba(255,149,0,1)'}
              />
            ) : (
              <TouchableNativeFeedback
                onPress={() => { this.navigateToRequestTvShow() }}
                background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                <View style={styles.addButton}>
                  <Text style={styles.principalButtonText}>{'Solicitar nueva serie'.toUpperCase()}</Text>
                </View>
              </TouchableNativeFeedback>
            )}
          </View>
        </View>
      </View>

    );
  }

  render() {
    // definición de los botones de los Modal

    // botones del Modal
    let modalButtons = null;

    return(
      <View style={styles.statusBarAndNavView}>
        <StatusBar hidden />
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

  renderScene(route, navigator) {
    let spinner = this.state.showProgress ? (
      <ActivityIndicator style={styles.loader}
                         size={'small'} color={'rgba(255,149,0,1)'} />
    ) : ( null );

    let notFound = this.state.showNotFound ? (
      <Animated.View style={[styles.notFound, {opacity: this.state.notFoundOpacity}]}>
        <View style={styles.notFoundCircle}>
          <Icon name={(Platform.OS === 'ios') ? 'ios-search' : 'md-search'} style={styles.notFoundIcon} />
        </View>
        <Text style={styles.notFoundText}>Sin resultados</Text>
        <View style={styles.solicitarSerie}>
          <Text style={styles.solicitarSerieQuestion}>¿No encuentras lo que buscas?</Text>
          <View style={styles.solicitarSerieButtonView}>
            {(Platform.OS === 'ios') ? (
              <Button
                onPress={() => { this.navigateToRequestTvShow() }}
                title={'Solicitar nueva serie'.toUpperCase()}
                color={'rgba(255,149,0,1)'}
              />
            ) : (
              <TouchableNativeFeedback
                onPress={() => { this.navigateToRequestTvShow() }}
                background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                <View style={styles.addButton}>
                  <Text style={styles.principalButtonText}>{'Solicitar nueva serie'.toUpperCase()}</Text>
                </View>
              </TouchableNativeFeedback>
            )}
          </View>
        </View>
      </Animated.View>
    ) : ( null );

    let { navBarElementsOpacity, searchHeight, searchWidth, searchMarginRight, searchBorderRadius } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.navBarView}>
          <Animated.Text style={[styles.navBarTitle, {opacity: navBarElementsOpacity}]}>Principal</Animated.Text>
          <Animated.View style={[styles.searchView,
            {height: searchHeight, width: searchWidth, right: searchMarginRight, borderRadius: searchBorderRadius}
          ]}>
            <Icon style={styles.backIcon} onPress={ this.onBackPress.bind(this, navigator) }
                  name={(Platform.OS === 'ios') ? 'ios-arrow-back-outline' : 'md-arrow-back'} />
            <TextInput
              autoFocus={true}
              placeholder='Buscar serie'
              placeholderTextColor={'rgba(255,255,255,0.4)'}
              style={styles.inputSearch}
              selectionColor={(Platform.OS === 'ios') ? 'rgba(255,149,0,1)' : 'rgba(255,149,0,0.5)'}
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              clearButtonMode={'always'}
              returnKeyType={'search'}
              onChangeText={ (text)=> this.setState({searchText: text}) }
              onSubmitEditing={ this.onSubmit.bind(this) }
            />
          </Animated.View>
          {(Platform.OS === 'ios') ?
            <Animated.View style={[styles.accountButtonView, {opacity: navBarElementsOpacity}]}>
              <Icon style={styles.accountButtonIcon} name={'ios-log-out'} />
            </Animated.View>
            :
            <Animated.View style={[styles.accountButtonView, {opacity: navBarElementsOpacity}]}>
              <View>
                <Icon style={styles.accountButtonIcon} name={'md-log-out'} />
              </View>
            </Animated.View>
          }
        </View>


        {spinner}

        <KeyboardAvoidingView behavior={'padding'} style={styles.viewBody}>
          {(this.state.showListView) ? (
            <Animated.View style={[styles.listViewContainer, {opacity: this.state.listviewOpacity}]}>
              <ListView
                style={styles.listView}
                dataSource={this.state.dataSource}
                renderHeader={() => this.renderHeader()}
                renderRow={(rowData) => this.renderRow(rowData)}
                renderFooter={() => this.renderFooter()}
                enableEmptySections={true}
              />
            </Animated.View>
          ) : (
            null
          )}
          {notFound}
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statusBarAndNavView: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#141414',
  },
  navBarView: {
    height: 56,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    backgroundColor: '#1f1f1f',
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.4,
        shadowRadius: 3,
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
  backIcon: {
    position: 'absolute',
    zIndex: 2,
    alignSelf: 'center',
    paddingLeft: 14,
    paddingRight: 10,
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: {
        paddingTop: 1,
        fontSize: 33,
      },
    }),
  },
  inputSearch: {
    flex: 1,
    margin: 0,
    padding: 0,
    paddingLeft: 46,
    color: 'white',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
      },
      ios: {
        marginTop: 1,
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
  viewBody: {
    flex: 1,
    justifyContent: 'flex-start',
    zIndex: -1,
  },
  listViewContainer: {
    flex: 1,
  },
  listView: {
    flex: 1,
  },
  listHeader: {
    backgroundColor: '#1f1f1f',
    padding: 14,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row'
  },
  listHeaderLeft: {
    flex: 1,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
      },
    }),
    color: 'rgba(255, 255, 255, 0.76)',
  },
  listHeaderRight: {
    alignSelf: 'flex-end',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
      },
    }),
    color: 'rgba(255, 255, 255, 0.76)',
  },
  rowTouch: {
    flex: 1,
    elevation: 2,
    backgroundColor: '#202020',
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flex: 1,
    borderRadius: 2
  },
  rowTop: {
    flex: 1,
  },
  rowImage: {
    height: 66,
    width: null,
    resizeMode: 'cover',
  },
  rowBottom: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
  },
  rowBottomLeft: {
    flex: 1,
  },
  rowTitle: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    fontSize: 16,
    color: '#rgba(255,255,255,0.96)',
  },
  rowSubtitle: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    fontSize: 12,
    color: '#rgba(255,255,255,0.56)',
  },
  rowBottomRight: {
    alignSelf: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#rgba(255,255,255,0.56)',
    marginRight: 3,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
  },
  ratingIcon: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.56)',
  },
  forwardIcon: {
    fontSize: 20,
    color: '#95959b',
    marginLeft: 20,
    marginTop: 3,
  },
  separatorView: {
    flex: 1,
    marginTop: 20,
    ...Platform.select({
      ios: {
        paddingBottom: 10,
      },
      android: {
        paddingBottom: 54,
      },
    }),
  },
  loader: {
    marginTop: 20
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundCircle: {
    height: 120,
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 200,
  },
  notFoundIcon: {
    fontSize: 50,
    color: 'rgba(255, 255, 255, 0.1)',
  },
  notFoundText: {
    marginTop: 10,
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  solicitarSerie: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  solicitarSerieQuestion: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    color: 'rgba(255, 255, 255, 0.6)',
  },
  solicitarSerieButtonView: {
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  addIcon: {
    color: '#ffffff',
  },
  principalButtonText: {
    color: 'rgba(255,149,0,1)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    fontSize: 14,
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
});

export default Search;
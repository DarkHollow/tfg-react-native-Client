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
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import PopularListItem from './components/popularListItem';

/* Constantes de URLs */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';

class Root extends Component {

  constructor() {
    super();
    this.state = {
      modalVisible: false,
      fetchEnded: false,
      popularData: {},
    }
  }

  componentWillMount() {
    this.getUserData().then(() => {
      this.getPopular();
    });
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

  onBackPress(navigator) {
    navigator.parentNavigator.pop();
  }

  // mostrar u ocultar modal: mostrar/ocultar, titulo, mensaje, mostrar/ocultar spinner
  setModalVisible(visible, title, message, loading) {
    this.setState({modalTitle: title});
    this.setState({modalMessage: message});
    this.setState({modalLoading: loading});
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

  getPopular() {
    console.log('obtener series populares');
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/tvshows/popular?size=10' : 'http://192.168.1.13:9000/api/tvshows/popular?size=10';

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
      this.setState({fetchEnded: true});
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

  render() {
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
              {(this.state.modalLoading) ? (
                <View style={styles.modalBottom}>
                  <View style={styles.modalBottomTopBorder} />
                  {(this.state.modalLoading) ? (
                    <ActivityIndicator style={styles.modalLoader}
                                       size={'small'} color={'rgba(255,149,0,1)'} />
                  ) : (
                    <View style={{flexDirection: 'row'}}>
                      {  }
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

  renderItem = ({item, index}) => (
    <PopularListItem
      onPress={this.openTvShow.bind(this, item.id)}
      jwt={this.state.jwt}
      tvShowId={item.id}
      imageWidth={(Platform.OS === 'ios') ? 70 : 70}
      imageHeight={(Platform.OS === 'ios') ? 103 : 103}
      backgroundColor={'#202020'}
      opacityColor={'rgba(255,149,0,1)'}
      useForeground
      source={item.poster !== null && item.poster !== undefined ? {uri: (URLSERVER + item.poster.substring(2))} : require('./img/placeholderPoster.png')}
      title={item.name + ' (' + new Date(item.firstAired).getFullYear() + ')'}
      titleSize={(Platform.OS === 'ios') ? 15 : 17}
      titleColor={'rgba(255,255,255,0.86)'}
      subtitleLeft={'#' + (index+1)}
      subtitleRight={item.trend > 0 ? '▲ ' + item.trend : item.trend === 0 ? '--' : '▼ ' + item.trend}
      subtitleLeftColor={'rgba(255,255,255,0.86)'}
      subtitleRightColor={item.trend > 0 ? 'rgba(0,230,0,0.56)' + item.trend : item.trend === 0 ? 'rgba(0,230,0,0.56)' : '#ba2c20'}
      score={item.score}
      voteCount={item.voteCount}
      resizeMode={'cover'}/>
  );

  renderScene(route, navigator) {

    return (
      <View style={styles.container}>
        <View style={styles.navBarView}>
          <Icon style={styles.backIcon} onPress={ this.onBackPress.bind(this, navigator) }
                name={(Platform.OS === 'ios') ? 'ios-arrow-back-outline' : 'md-arrow-back'} />
          <Text style={styles.navBarTitle}>Series más populares</Text>
        </View>

        <FlatList vertical
                  style={styles.popularList}
                  contentContainerStyle={styles.popularListContent}
                  data={this.state.popularData.tvShows}
                  renderItem={this.renderItem.bind(this)}
                  keyExtractor={this.keyExtractor.bind(this)}
                  extraData={this.state.popularData}
        />

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
        shadowOpacity: 0.7,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  backIcon: {
    position: 'absolute',
    zIndex: 2,
    alignSelf: 'center',
    paddingTop: 1,
    paddingLeft: 14,
    paddingRight: 10,
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: {
        paddingTop: 3,
        fontSize: 33,
      },
    }),
  },
  navBarTitle: {
    marginLeft: 34,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium'
      },
    }),
  },
  popularList: {
    alignSelf: 'stretch',
  },
  popularListContent: {
    paddingTop: 4,
    ...Platform.select({
      ios: {
      },
      android: {
        paddingBottom: 48,
      }
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
    fontSize: 11,
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
});

export default Root;

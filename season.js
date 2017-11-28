import React, { Component } from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  View,
  StatusBar,
  Alert,
  ScrollView,
  Animated,
  TouchableHighlight,
  AsyncStorage,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import ReadMore from '@expo/react-native-read-more-text';

const TouchableNativeFeedback = Platform.select({
  android: () => require('TouchableNativeFeedback'),
  ios: () => null,
})();

/* Constantes efecto Parallax */
const {height, width} = Dimensions.get('window');
const HEADER_MAX_HEIGHT = height;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const HEADER_SCROLL_DISTANCE_TOP = 200 - HEADER_MIN_HEIGHT;

/* Constantes de URLs */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';

class Season extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: 0,
      userName: '',
      jwt: '',
      tvShowId: this.props.tvShowId,
      seasonNumber: this.props.seasonNumber,
      fetchEnded: false,
      viewOpacity: 1,
      seasonData: {},
      scrollY: new Animated.Value(0),
      posterOpacity: new Animated.Value(0),
      fanartOpacity: new Animated.Value(0),
    }
  }

  // obtener datos usuario
  async getUserDataAndFetchData() {
    await AsyncStorage.multiGet(['userId', 'userName', 'jwt']).then((userData) => {
      this.setState({
        userId: userData[0][1],
        userName: userData[1][1],
        jwt: userData[2][1]
      });
      this.getSeason();
    });
  }

  getSeason() {
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/tvshows/' : 'http://192.168.1.13:9000/api/tvshows/';
    const SEASONS = '/seasons/';

    // hacemos fetch a la API
    fetch(URL + this.state.tvShowId + SEASONS + this.state.seasonNumber, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.state.jwt,
      }
    }).then((response) => response.json())
      .then((responseData) => {
        // procesamos datos
        this.processData(responseData);
      }).then( () => {
      // indicamos que fetch ha terminado
      this.setState({fetchEnded: true});
    }).catch((error) => {
      console.log(error.stack);
      this.errorAndPop();
    });
  }

  errorAndPop() {
    Alert.alert('Error', 'Lamentablemente no se han podido cargar los datos de la season');
    this.props.navigator.pop();
  }

  componentWillMount() {
    console.log('Consulta season: ' + this.state.seasonNumber + ' de tvshow: ' + this.state.tvShowId);
    this.getUserDataAndFetchData();
  }

  processData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error) {
      if (data.error === 'Not found') {
        // id no encontrada
      } else {
        // otro tipo de error interno
      }
      // mostramos error y volvemos atrás
      console.log(data);
      this.errorAndPop();
    } else {
      // procesamos URLs imagenes
      data.poster = this.formatImageUri(data.poster);

      // procesamos orden temporadas
      /*data.seasons.sort(function(a, b) {
        return a.seasonNumber - b.seasonNumber;
      });*/

      // cargamos datos en el state
      this.setState({seasonData: data});
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

  /* animaciones */
  onPosterLoadEnded() {
    Animated.timing(this.state.posterOpacity, {
      toValue: 1,
      duration: 500
    }).start();
  }

  onFanartLoadEnded() {
    if (this.state.fanartOpacity !== 1) {
      Animated.timing(this.state.fanartOpacity, {
        toValue: 1,
        duration: 500
      }).start();
    }
  }

  onBackPress(navigator) {
    navigator.parentNavigator.pop();
  }

  /* render */
  render() {
    return (
      <View style={styles.statusBarAndNavView}>
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
      </View>
    );
  }

  renderScene(route, navigator) {
    /* calculo efecto parallax */
    const imageTranslate = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -50],
      extrapolate: 'clamp',
    });
    /* calculo de la opacidad de la barra top */
    const topBarOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE_TOP / 2, HEADER_SCROLL_DISTANCE_TOP],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });

    let overview = this.state.fetchEnded ? (
      <ReadMore numberOfLines={3}
                renderTruncatedFooter={this.overviewTruncatedFooter}
                renderRevealedFooter={this.overviewRevealedFooter}>
        <Text style={styles.overview}>{this.state.seasonData.overview}</Text>
      </ReadMore>
    ) : (
      null
    );

    const LinearGradientAnimated = Animated.createAnimatedComponent(LinearGradient);

    return (
      (this.state.fetchEnded) ? (
        <View style={[styles.container]}>{/* contenedor total incluyendo modals, etc */}
          {/* contenedor de la vista */}
          <View style={styles.containerDark}>
            <View style={styles.backIconView}>
              <Icon style={styles.backIcon} onPress={ this.onBackPress.bind(this, navigator) }
                    name={(Platform.OS === 'ios') ? 'ios-arrow-back-outline' : 'md-arrow-back'}>
              </Icon>
              <Text style={styles.backButtonText} onPress={ this.onBackPress.bind(this, navigator) }>{this.props.backButtonText}</Text>
            </View>
            <View style={styles.navButtons}>

              <View style={styles.linearGradientContainer}>
                <LinearGradientAnimated style={[styles.topBarOverlay, {opacity: topBarOpacity}]}
                                        colors={['#000', 'transparent']} />
              </View>

            </View>

            <View style={styles.fanArtOverlay} />
            <LinearGradientAnimated style={[styles.bodyLinear]}
                                    colors={['transparent', '#000']} />
            <Animated.Image style={[
              styles.fanArt,
              {transform: [{translateY: imageTranslate}]},
              {opacity: this.state.fanartOpacity},
            ]}
                            source={this.state.seasonData.poster !== null ? {uri: this.state.seasonData.poster} : require('./img/placeholderFanart.png')}
                            onLoadEnded={this.onFanartLoadEnded()}
            />

            <ScrollView style={styles.scrollViewV}
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                          [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}]
                        )}
            >
              <View style={styles.scrollViewContent}>
                <View style={styles.zIndexFix} />
                <View style={styles.headerContent}>
                  <LinearGradient style={[styles.headerContentGradient]}
                                  locations={[0, 0.3, 0.7, 1]}
                                          colors={['transparent', '#000', '#000', 'transparent']} />
                  <Animated.Image style={[styles.poster, {opacity: this.state.posterOpacity}]} source={this.state.seasonData.poster !== null ? {uri: this.state.seasonData.poster} : require('./img/placeholderPoster.png')} onLoadEnded={this.onPosterLoadEnded()} />
                  <View style={styles.headerData}>
                    <Text style={styles.tvShowTitle} numberOfLines={1}>{this.state.seasonData.name}</Text>
                    <View style={styles.tvShowSubtitle}>
                      <View style={styles.tvShowSubtitleLeft}>
                        <Text style={styles.tvSubtitleText}>Temporada {this.state.seasonData.seasonNumber} de {this.props.backButtonText}</Text>
                        <Text style={styles.tvShowFirstAired} numberOfLines={1}>Estreno el {new Date(this.state.seasonData.firstAired).toLocaleDateString()}</Text>
                      </View>
                    </View>
                  </View>

                </View>

                <View style={styles.bodyContent}>
                  { overview }
                </View>

              </View>
              {(Platform.OS === 'android') ?
                <View style={styles.scrollPaddingBottom} /> : null}
            </ScrollView>
          </View>

        </View>
      ) : (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator style={styles.loader} size={'large'} color={'rgba(255,149,0,1)'} />
        </View>
      )
    );
  }

  overviewTruncatedFooter = (handlePress) => {
    return (
      (Platform.OS === 'ios') ?
        <View style={styles.readMoreView}>
          <TouchableHighlight style={styles.readMoreButton}
                              onPress={ handlePress } underlayColor={'rgba(255,179,0,0.5)'}>
            <Text style={styles.readMoreText}>LEER MÁS</Text>
          </TouchableHighlight>
        </View>
        :
        <View style={styles.readMoreView}>
          <TouchableNativeFeedback
            onPress={ handlePress }
            delayPressIn={0}
            background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
            <View style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>LEER MÁS</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
    );
  };

  overviewRevealedFooter = (handlePress) => {
    return (
      (Platform.OS === 'ios') ?
        <View style={styles.readMoreView}>
          <TouchableHighlight style={styles.readMoreButton}
                              onPress={ handlePress } underlayColor={'rgba(255,179,0,0.5)'}>
            <Text style={styles.readMoreText}>LEER MENOS</Text>
          </TouchableHighlight>
        </View>
        :
        <View style={styles.readMoreView}>
          <TouchableNativeFeedback
            onPress={ handlePress }
            delayPressIn={0}
            background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
            <View style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>LEER MENOS</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
    );
  };

}

const styles = StyleSheet.create({
  // StatusBar y Navigator
  statusBarAndNavView: {
    flex: 1,
  },
  nav: {
    ...Platform.select({
      ios: {},
      android: {
        marginTop: 2,
      }
    }),
  },
  linearGradientContainer: {
    flex: 1,
  },
  topBarOverlay: {
    flex: 1,
  },
  navButtons: {
    position: 'absolute',
    height: 70,
    left: 0,
    top: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  backIconView: {
    position: 'absolute',
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    paddingTop: 16,
    paddingLeft: 14,
    paddingRight: 10,
    backgroundColor: 'transparent',
    fontSize: 24,
    color: '#ddd',
    ...Platform.select({
      ios: {
        paddingTop: 11,
        fontSize: 33,
      },
    }),
  },
  backButtonText: {
    fontSize: 20,
    marginTop: 7.5,
    backgroundColor: 'transparent',
    color: '#ddd',
    ...Platform.select({
      android: {
        marginTop: 15,
      },
    }),
  },
  // container total
  container: {
    flex: 1,
  },
  // vista escena
  containerDark: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#212121',
  },
  // overlay oscuro para la imagen de cabecera grande
  fanArtOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: null,
    height: HEADER_MAX_HEIGHT,
    backgroundColor: 'black',
    opacity: 0.6,
    zIndex: -1,
  },
  // imagen de cabecera (fanart)
  fanArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: HEADER_MAX_HEIGHT,
    resizeMode: 'cover',
    zIndex: -2,
  },
  bodyLinear: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  // scrollview vertical de la vista
  scrollViewV: {
    flex: 1,
  },
  scrollViewContent: {
    flex: 1,
    marginTop: 80,
    backgroundColor: 'transparent',
    ...Platform.select({
      android: {
        marginTop: 30,
      },
    }),
  },
  zIndexFix: {
    ...Platform.select({
      android: {
        height: 50,
        backgroundColor: 'transparent',
      }
    }),
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  headerContentGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  // imagen poster del tv show
  poster: {
    height: 147,
    width: 100,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  // vista donde estan el titulo y demas
  headerData: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    paddingTop: 0,
    paddingRight: 0,
  },
  tvShowTitle: {
    alignSelf: 'stretch',
    height: 22,
    fontSize: 17,
    color: '#ededed',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        fontWeight: '500',
        opacity: 1,
      },
      android: {
        fontFamily: 'Roboto-Medium',
        opacity: 0.9,
      }
    }),
  },
  tvShowSubtitle: {
    ...Platform.select({
      android: {
        marginTop: 0,
      }
    }),
  },
  tvSubtitleText: {
    color: '#bbbbc1',
    ...Platform.select({
      ios: {
        marginTop: 2,
        fontSize: 12.5,
        fontWeight: '500',
      },
      android: {
        marginTop: 7,
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
      }
    }),
  },
  tvShowFirstAired: {
    color: '#bbbbc1',
    ...Platform.select({
      ios: {
        fontSize: 12.5,
        fontWeight: '500',
      },
      android: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
      }
    }),
  },
  // contenido del cuerpo debajo de la cabecera
  bodyContent: {
    flex: 1,
    minHeight: HEADER_MAX_HEIGHT - 80 - 14 - 147 - 10 - 6 - 6,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 6,
    backgroundColor: 'transparent',
    ...Platform.select({
      android: {
        minHeight: HEADER_MAX_HEIGHT - 80 - 14 - 147 - 10 - 6 - 6 - 50,
      },
    }),
  },
  overview: {
    backgroundColor: 'transparent',
    fontSize: 14,
    lineHeight: 18,
    color: '#dadade',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
        lineHeight: 22,
      }
    }),
  },
  readMoreView: {
    marginTop: 2,
    marginBottom: 4,
    alignSelf: 'center',
    borderRadius: 5
  },
  readMoreButton: {
    borderRadius: 5,
    paddingTop: 4,
    paddingRight: 6,
    paddingBottom: 4,
    paddingLeft: 6
  },
  readMoreText: {
    color: 'rgba(255,149,0,1)',
    textAlign: 'center',
    fontSize: 15,
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  modalLoader: {
    position: 'absolute',
    padding: 0,
  },
  scrollPaddingBottom: {
    paddingBottom: 50,
  }
});

export default Season;

import React, { Component } from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  View,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Image,
  Animated,
} from 'react-native';

const TouchableNativeFeedback = Platform.select({
  android: () => require('TouchableNativeFeedback'),
  ios: () => null,
})();

import Icon from 'react-native-vector-icons/Ionicons';
import CircularButton from './components/circularButton';
import SeasonButton from './components/seasonButton';

/* Constantes efecto Parallax */
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

class Series extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seriesId: this.props.seriesId,
      fetchEnded: false,
      seriesData: {},
      seriesGenres: '',
      scrollY: new Animated.Value(0),
    }
  }

  errorAndPop() {
    Alert.alert('Error', 'Lamentablemente no se han podido cargar los datos de la serie');
    this.props.navigator.pop();
  }

  componentWillMount() {
    console.log('Consulta serie id: ' + this.state.seriesId);
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/series/' : 'http://192.168.1.13:9000/api/series/';

    // hacemos fetch a la API
    fetch(URL + this.state.seriesId, {method: "GET"})
    .then((response) => response.json())
    .then((responseData) => {
      // procesamos datos
      this.processData(responseData);
    }).then( () => {
      // indicamos que fetch ha terminado
      this.setState({fetchEnded: true});
    }).catch((error) => {
      this.errorAndPop();
    });
  }

  processData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error != undefined) {
      if (data.error == 'Not Found') {
        // id no encontrada
      } else {
        // otro tipo de error interno
      }
      // mostramos error y volvemos atrás
      this.errorAndPop();
    } else {
      // cargamos datos en el state
      this.setState({seriesData: data});
      // procesamos los generos
      this.setState({seriesGenres : data.genre.join(', ')});
    }
  }

  render() {
    return (
      <View style={styles.statusBarAndNavView}>
        <StatusBar
          animated
          translucent
          barStyle="light-content"
          backgroundColor={'transparent'}
        />
        <Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
          navigationBar={
            <Navigator.NavigationBar
              routeMapper={NavigationBarRouteMapper(this.props)}
              style={styles.nav} />
          }
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
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 0, 0.8],
      extrapolate: 'clamp',
    });


    return (
      <View style={styles.containerDark}>
        <Animated.View style={[styles.topBarOverlay, {opacity: topBarOpacity}]} />
        <View style={styles.fanArtOverlay} />
        <Animated.Image style={[
          styles.fanArt,
          {transform: [{translateY: imageTranslate}]},
            /*TODO: {opacity: this.state.fanArt}, usar algo asi para animar la opacidad*/
          ]}
          source={{uri: this.state.seriesData.fanart}}
        />

        <ScrollView style={styles.scrollViewV}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}]
          )}
        >
          <View style={styles.scrollViewContent}>
            <View style={styles.zIndexFix} />
            </*header*/View style={styles.headerContent}>
              <Image style={styles.poster} source={{uri: this.state.seriesData.poster}} />
              <View style={styles.seriesTitleSubtitleGenre}>
                <Text style={styles.seriesTitle} numberOfLines={1}>{this.state.seriesData.seriesName}</Text>
                <Text style={styles.seriesSubtitle}>{new Date(this.state.seriesData.firstAired).getFullYear()}   <Text numberOfLines={1}>{this.state.seriesData.rating}</Text></Text>
                <Text style={styles.seriesGenre} numberOfLines={1}>{this.state.seriesGenres}</Text>
              </View>
              <View style={styles.ratingAndRuntimeView}>
                <Text style={styles.ratingText}>
                  <Icon name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} style={styles.ratingIcon}/> 4,7
                </Text>
                <Text style={styles.runtimeText} numberOfLines={1}>
                  <Icon name={(Platform.OS === 'ios') ? 'ios-time-outline' : 'md-time'} /> {this.state.seriesData.runtime} min
                </Text>
                <Text style={styles.networkText} numberOfLines={1}>
                  <Icon name={(Platform.OS === 'ios') ? 'ios-desktop' : 'md-desktop'} /> {this.state.seriesData.network}
                </Text>
              </View>
            </View>

            </*body*/View style={styles.bodyContent}>

              <View style={styles.principalButtons}>
                <CircularButton/* los tres botones principales de la vista*/
                  disabled
                  size={(Platform.OS === 'ios') ? 35 : 40}
                  backgroundColor={'transparent'}
                  opacityColor={'#fe3f80'}
                  icon={(Platform.OS === 'ios') ? 'ios-film' : 'md-film'}
                  iconSize={20}
                  iconColor={(Platform.OS === 'ios') ? '#aaaaaa' : '#bbbbc1'}
                  style={{marginRight: 30}}
                />
                <CircularButton
                  size={(Platform.OS === 'ios') ? 45 : 55}
                  backgroundColor={'transparent'}
                  opacityColor={'#fe3f80'}
                  icon={(Platform.OS === 'ios') ? 'ios-eye' : 'md-eye'}
                  iconSize={30}
                  iconColor={(Platform.OS === 'ios') ? '#aaaaaa' : '#bbbbc1'}
                />
                <CircularButton
                  size={(Platform.OS === 'ios') ? 35 : 40}
                  backgroundColor={'transparent'}
                  opacityColor={'#fe3f80'}
                  icon={(Platform.OS === 'ios') ? 'ios-more' : 'md-more'}
                  iconSize={20}
                  iconColor={(Platform.OS === 'ios') ? '#aaaaaa' : '#bbbbc1'}
                  style={{marginLeft: 30}}
                />
              </View>

              <Text numberOfLines={3} style={styles.overview}>{this.state.seriesData.overview}/*encontrar manera de animar con mostrar más mostrar menos... altura?*/</Text>
            </View>

            </*footer*/View style={styles.footerContent}/*reparto y estado*/>
              <View style={styles.footerTitleView}>
                <Text style={styles.footerTitle}>Guionista/s</Text>
                <Text style={styles.footerTitle}>Reparto</Text>
                <Text style={styles.footerTitle}>Estado</Text>
              </View>
              <View style={styles.footerDataView}>
                <Text style={styles.footerData} numberOfLines={1}>Matt Duffer, Ross Duffer</Text>
                <Text style={styles.footerData} numberOfLines={1}>Winona Ryder, Millie Brown, Noah</Text>
                <Text style={styles.footerData}>{(this.state.seriesData.status === 'Ended' ? 'Finalizada' : 'Continuada')}</Text>
              </View>
            </View>

            </*anexo: temporadas, de prueba, procesar esto cuando llegue el momento!*/View style={styles.seasonsContent}>
              <ScrollView horizontal style={styles.scrollH}>

                <SeasonButton
                  imageWidth={(Platform.OS === 'ios') ? 110 : 120}
                  imageHeight={(Platform.OS === 'ios') ? 159 : 173}
                  backgroundColor={'#212121'}
                  opacityColor={'#fe3f80'}
                  source={'https://thetvdb.com/banners/seasons/305288-1-3.jpg'}
                  title={'Temporada 1'}
                  titleSize={(Platform.OS === 'ios') ? 13 : 14}
                  titleColor={'#dedede'}
                  subtitle={'8 episodios'}
                  subtitleSize={(Platform.OS === 'ios') ? 13 : 14}
                  subtitleColor={'#bbbbc1'}
                />

                <SeasonButton
                  imageWidth={(Platform.OS === 'ios') ? 110 : 120}
                  imageHeight={(Platform.OS === 'ios') ? 159 : 173}
                  backgroundColor={'#212121'}
                  opacityColor={'#fe3f80'}
                  source={'https://thetvdb.com/banners/seasons/305288-1-3.jpg'}
                  title={'Temporada 1'}
                  titleSize={(Platform.OS === 'ios') ? 13 : 14}
                  titleColor={'#dedede'}
                  subtitle={'8 episodios'}
                  subtitleSize={(Platform.OS === 'ios') ? 13 : 14}
                  subtitleColor={'#bbbbc1'}
                />

                <SeasonButton
                  imageWidth={(Platform.OS === 'ios') ? 110 : 120}
                  imageHeight={(Platform.OS === 'ios') ? 159 : 173}
                  backgroundColor={'#212121'}
                  opacityColor={'#fe3f80'}
                  source={'https://thetvdb.com/banners/seasons/305288-1-3.jpg'}
                  title={'Temporada 1'}
                  titleSize={(Platform.OS === 'ios') ? 13 : 14}
                  titleColor={'#dedede'}
                  subtitle={'8 episodios'}
                  subtitleSize={(Platform.OS === 'ios') ? 13 : 14}
                  subtitleColor={'#bbbbc1'}
                />

                <SeasonButton
                  imageWidth={(Platform.OS === 'ios') ? 110 : 120}
                  imageHeight={(Platform.OS === 'ios') ? 159 : 173}
                  backgroundColor={'#212121'}
                  opacityColor={'#fe3f80'}
                  source={'https://thetvdb.com/banners/seasons/305288-1-3.jpg'}
                  title={'Temporada 1'}
                  titleSize={(Platform.OS === 'ios') ? 13 : 14}
                  titleColor={'#dedede'}
                  subtitle={'8 episodios'}
                  subtitleSize={(Platform.OS === 'ios') ? 13 : 14}
                  subtitleColor={'#bbbbc1'}
                />

                <SeasonButton
                  imageWidth={(Platform.OS === 'ios') ? 110 : 120}
                  imageHeight={(Platform.OS === 'ios') ? 159 : 173}
                  backgroundColor={'#212121'}
                  opacityColor={'#fe3f80'}
                  source={'https://thetvdb.com/banners/seasons/305288-1-3.jpg'}
                  title={'Temporada 1'}
                  titleSize={(Platform.OS === 'ios') ? 13 : 14}
                  titleColor={'#dedede'}
                  subtitle={'8 episodios'}
                  subtitleSize={(Platform.OS === 'ios') ? 13 : 14}
                  subtitleColor={'#bbbbc1'}
                />
              </ScrollView>
            </View>
          </View>
          {(Platform.OS === 'android') ?
            <View style={styles.scrollPaddingBottom} /> : null}
        </ScrollView>
      </View>
    );
  }

}

var NavigationBarRouteMapper = props => ({
  LeftButton(route, navigator, index, navState) {
    return (
      <View style={styles.backButtonView}>
        <TouchableOpacity style={styles.backButton}
            onPress={() => navigator.parentNavigator.pop()}>
          <Icon
            name={(Platform.OS === 'ios') ? 'ios-arrow-back' : 'md-arrow-back'}
            style={styles.backIcon}
          />
          {/*<Text style={styles.backButtonText}>
            Atrás
          </Text>*/}
        </TouchableOpacity>
      </View>
    );
  },
  RightButton(route, navigator, index, navState) {
    return null;
  },
  Title(route, navigator, index, navState) {
    return (
      <View style={styles.titleView}>
        <Text style={styles.titleText}>

        </Text>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  // StatusBar y Navigator
  statusBarAndNavView: {
    flex: 1,
  },
  nav: {
    ...Platform.select({
      ios: {},
      android: {
        marginTop: 24,
      }
    }),
  },
  backButtonView: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        padding: 8.5,
        paddingTop: 5.5,
      },
      android: {
        padding: 14,
      }
    }),
  },
  backIcon: {
    color: '#dddddd',
    ...Platform.select({
      ios: {
        fontSize: 33,
        shadowColor: '#000000',
        shadowOffset: {
        },
        shadowOpacity: 0.8,
      },
      android: {
        fontSize: 24,
        elevation: 2,
      }
    }),
  },

  backButtonText: {
    color: '#dddddd',
    fontSize: 17,
    ...Platform.select({
      ios: {
        marginTop: 6,
        marginLeft: 6,
      },
      android: {
        marginLeft: 4,
      }
    }),

  },
  // vista escena
  containerDark: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#212121',
  },
  // barra superior (simulando navigator)
  topBarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    backgroundColor: 'black',
    width: null,
    ...Platform.select({
      ios: {
        height: 64,
      },
      android: {
        height: 77,
      }
    }),
    zIndex: 1,
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
  // scrollview vertical de la vista
  scrollViewV: {
    flex: 1,
  },
  scrollViewContent: {
    flex: 1,
    marginTop: HEADER_MAX_HEIGHT,
    ...Platform.select({
      ios: {
        backgroundColor: '#212121',
      }
    }),
  },
  zIndexFix: {
    ...Platform.select({
      android: {
        height: 50,
        backgroundColor: '#212121',
      }
    }),
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    height: 70,
    padding: 14,
    paddingTop: 0,
    paddingBottom: 0,
    ...Platform.select({
      ios: {
        marginTop: -22,
      },
      android: {
        marginTop: -70,
      },
    }),
  },
  // imagen poster de la serie
  poster: {
    marginTop: -86,
    height: 147,
    width: 100,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  // vista donde estan el titulo, año, content rating y generos de la serie
  seriesTitleSubtitleGenre: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    paddingTop: 0,
    ...Platform.select({
      ios: {
        marginTop: -2
      },
      android: {
        marginTop: -10,
      }
    }),
  },
  seriesTitle: {
    color: '#eaeaea',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500',
        opacity: 0.9,
      },
      android: {
        fontFamily: 'Roboto-Medium',
        fontSize: 20,
        opacity: 0.8,
      }
    }),
  },
  seriesSubtitle: {
    color: '#bbbbc1',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        marginTop: 10,
        fontSize: 12.5,
        fontWeight: '200',
      },
      android: {
        marginTop: 7,
        fontFamily: 'Roboto-Light',
        fontSize: 13,
      }
    }),
  },
  seriesGenre: {
    color: '#bbbbc1',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        fontSize: 12.5,
        fontWeight: '200',
      },
      android: {
        fontFamily: 'Roboto-Light',
        fontSize: 13,
      }
    }),
  },
  // vista donde están la puntuacion, runtime y network de la serie
  ratingAndRuntimeView: {
    ...Platform.select({
      ios: {
        marginTop: 1,
      },
      android: {
        marginTop: -4,
      }
    }),
  },
  ratingText: {
    color: '#eaeaea',
    backgroundColor: 'transparent',
    textAlign: 'right',
    ...Platform.select({
      ios: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.9,
      },
      android: {
        fontFamily: 'Roboto-Medium',
        fontSize: 15,
        opacity: 0.8,
      }
    }),
  },
  ratingIcon: {
    fontSize: 14,
  },
  runtimeText: {
    color: '#eaeaea',
    backgroundColor: 'transparent',
    textAlign: 'right',
    ...Platform.select({
      ios: {
        marginTop: 10.5,
        fontSize: 12.5,
        fontWeight: '200',
        opacity: 0.8,
      },
      android: {
        marginTop: 8,
        fontFamily: 'Roboto-Light',
        fontSize: 13,
        opacity: 0.6,
      }
    }),
  },
  networkText: {
    color: '#eaeaea',
    backgroundColor: 'transparent',
    textAlign: 'right',
    ...Platform.select({
      ios: {
        fontSize: 12.5,
        fontWeight: '200',
        opacity: 0.8,
      },
      android: {
        fontFamily: 'Roboto-Light',
        fontSize: 13,
        opacity: 0.6,
      }
    }),
  },
  // contenido del cuerpo debajo de la cabecera
  bodyContent: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#212121',
  },
  principalButtons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        justifyContent: 'space-between',
        marginTop: 6,
        marginBottom: 14,
      },
      android: {
        justifyContent: 'center',
        marginBottom: 7,
      }
    }),
  },
  overview: {
    color: '#bbbbc1',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        lineHeight: 24,
      }
    }),
  },
  // contenido del pie: reparto, estado de la serie, y por ultimo, temporadas?
  footerContent: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 20,
  },
  footerTitleView: {
    flexDirection: 'column',
  },
  footerTitle: {
    fontSize: 16,
    color: '#919191',
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
      }
    }),
  },
  footerDataView: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 8,
  },
  footerData: {
    color: '#bbbbc1',
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
      }
    }),
  },
  // temporadas!
  seasonsContent: {
    flex: 1,
    marginTop: 20,
  },
  scrollH: {
    backgroundColor: '#1C1C1C',
    padding: 2,
    paddingRight: 0,
  },
  scrollPaddingBottom: {
    paddingBottom: 50,
  }
});

export default Series;

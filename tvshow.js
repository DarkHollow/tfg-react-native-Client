import React, { Component } from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Animated,
  TouchableHighlight,
  AsyncStorage,
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import ReadMore from '@expo/react-native-read-more-text';

//import CircularButton from './components/circularButton';
//import SeasonButton from './components/seasonButton';

const TouchableNativeFeedback = Platform.select({
  android: () => require('TouchableNativeFeedback'),
  ios: () => null,
})();

/* Constantes efecto Parallax */
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

/* Constantes de URLs */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';

class TvShow extends Component {
  constructor(props) {
    super(props);

    (Platform.OS === 'ios') ? (
      this.state = {
        userId: 0,
        userName: '',
        jwt: '',
        tvShowId: this.props.tvShowId,
        fetchEnded: false,
        tvShowData: {},
        tvShowGenres: '',
        imdbRating: 0,
        scrollY: new Animated.Value(0),
        posterOpacity: new Animated.Value(0),
        fanartOpacity: new Animated.Value(0),
        youtubeOpacity: new Animated.Value(0),
        showVideoPlayer: false,
        isReady: false,
        status: null,
        quality: null,
        error: null,
        isPlaying: false,
      }
    ) : (
      this.state = {
        userId: 0,
        userName: '',
        jwt: '',
        tvShowId: this.props.tvShowId,
        fetchEnded: false,
        tvShowData: {},
        tvShowGenres: '',
        imdbRating: 0,
        scrollY: new Animated.Value(0),
        posterOpacity: new Animated.Value(0),
        fanartOpacity: new Animated.Value(0),
      }
    )
  }

  // obtener datos usuario
  async getUserDataAndFetchTvShow() {
    await AsyncStorage.multiGet(['userId', 'userName', 'jwt']).then((userData) => {
      this.setState({
        userId: userData[0][1],
        userName: userData[1][1],
        jwt: userData[2][1]
      });

      this.getTvShow();
    });
  }

  getTvShow() {
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/tvshow/' : 'http://192.168.1.13:9000/api/tvshow/';
    
    // hacemos fetch a la API
    fetch(URL + this.state.tvShowId, {
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
    Alert.alert('Error', 'Lamentablemente no se han podido cargar los datos del tv show');
    this.props.navigator.pop();
  }

  componentWillMount() {
    console.log('Consulta tv show id: ' + this.state.tvShowId);
    this.getUserDataAndFetchTvShow();
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
      data.fanart = this.formatImageUri(data.fanart);
      data.poster = this.formatImageUri(data.poster);
      data.banner = this.formatImageUri(data.banner);

      // cargamos datos en el state
      this.setState({tvShowData: data});
      // procesamos los generos
      this.setState({tvShowGenres : data.genre.join(', ').replace(/"/g, '')});
      // procesamos la nota media
      //this.setState({imdbRating: (data.imdbRating).toFixed(1)});
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
    Animated.timing(this.state.fanartOpacity, {
      toValue: 1,
      duration: 500
    }).start();
  }

  playTrailer() {
    Animated.timing(this.state.youtubeOpacity, {
      toValue: 1,
      duration: 500
    }).start(() => {
      this.setState({
        showVideoPlayer: true,
        isPlaying: true,
      });
    });
  }

  hideVideoPlayer() {
    this.setState({isPlaying: false});

    Animated.timing(this.state.youtubeOpacity, {
      toValue: 0,
      duration: 500
    }).start(() => {
      this.setState({
        showVideoPlayer: false,
      });
    });
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
        />
        <CustomComponents.Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
          navigationBar={
            <CustomComponents.Navigator.NavigationBar
              routeMapper={NavigationBarRouteMapper(this)}
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

    let overview = this.state.fetchEnded ? (
      <ReadMore numberOfLines={3}
                renderTruncatedFooter={this.overviewTruncatedFooter}
                renderRevealedFooter={this.overviewRevealedFooter}
                onReady={this.overviewReady}>
        <Text style={styles.overview}>{this.state.tvShowData.overview}</Text>
      </ReadMore>
    ) : (
      null
    );

    return (
      <View style={styles.containerDark}>

        <Animated.View style={[styles.topBarOverlay, {opacity: topBarOpacity}]} />
        <View style={styles.fanArtOverlay} />
        <Animated.Image style={[
            styles.fanArt,
            {transform: [{translateY: imageTranslate}]},
            {opacity: this.state.fanartOpacity},
          ]}
          source={this.state.tvShowData.fanart !== null ? {uri: this.state.tvShowData.fanart} : require('./img/placeholderFanart.png')}
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
              <Animated.Image style={[styles.poster, {opacity: this.state.posterOpacity}]} source={this.state.tvShowData.poster !== null ? {uri: this.state.tvShowData.poster} : require('./img/placeholderPoster.png')} onLoadEnded={this.onPosterLoadEnded()} />
              <View style={styles.headerData}>
                <Text style={styles.tvShowTitle} numberOfLines={1}>{this.state.tvShowData.name}</Text>
                <View style={styles.tvShowSubtitle}>
                  <View style={styles.tvShowSubtitleLeft}>
                    <Text style={styles.tvShowYearRating}>{new Date(this.state.tvShowData.firstAired).getFullYear()}   <Text numberOfLines={1}>{this.state.tvShowData.rating}</Text></Text>
                    <Text style={styles.tvShowGenre} numberOfLines={1}>{this.state.tvShowGenres}</Text>
                  </View>
                  <View style={styles.subtitleRight}>
                    {/*<Text style={styles.ratingText}>
                      <Icon name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} style={styles.ratingIcon}/> {this.state.imdbRating}
                    </Text>*/}
                    <Text style={styles.runtimeText} numberOfLines={1}>
                      <Icon name={(Platform.OS === 'ios') ? 'ios-time-outline' : 'md-time'} /> {this.state.tvShowData.runtime} min
                    </Text>
                    <Text style={styles.networkText} numberOfLines={1}>
                      <Icon name={(Platform.OS === 'ios') ? 'ios-desktop' : 'md-desktop'} /> {this.state.tvShowData.network}
                    </Text>
                  </View>
                </View>
              </View>

            </View>

            <View style={styles.bodyContent}>

              {/*<View style={styles.principalButtons}>
                <CircularButton
                  size={(Platform.OS === 'ios') ? 35 : 40}
                  backgroundColor={'transparent'}
                  opacityColor={'#fe3f80'}
                  icon={(Platform.OS === 'ios') ? 'ios-film' : 'md-film'}
                  iconSize={20}
                  iconColor={(Platform.OS === 'ios') ? '#aaaaaa' : '#bbbbc1'}
                  style={{marginRight: 30}}
                  disabled={(!this.state.tvShowData.trailer)}
                  link={ (Platform.OS !== 'ios') }
                  onPress={ (Platform.OS === 'ios') ? () => this.playTrailer() : 'https://www.youtube.com/watch?v=' + this.state.tvShowData.trailer }
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
              </View>*/}
              { overview }
            </View>

            <View style={styles.footerContent}>
              <View style={styles.footerTitleView}>
                {/*<Text style={styles.footerTitle}>Guionista/s</Text>
                <Text style={styles.footerTitle}>Reparto</Text>*/}
                <Text style={styles.footerTitle}>Estado</Text>
              </View>
              <View style={styles.footerDataView}>
                {/*<Text style={styles.footerData} numberOfLines={1}>{this.state.tvShowData.writer}</Text>
                <Text style={styles.footerData} numberOfLines={1}>{this.state.tvShowData.actors}</Text>*/}
                <Text style={styles.footerData}>{(this.state.tvShowData.status === 'Ended' ? 'Finalizada' : 'Continuada')}</Text>
              </View>
            </View>

            {/*<View style={styles.seasonsContent}>
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
            </View>*/}
          </View>
          {(Platform.OS === 'android') ?
            <View style={styles.scrollPaddingBottom} /> : null}
        </ScrollView>
      </View>
    );
  }

  // pie del resumen de la serie (leer mas)
  overviewReady = () => {
    console.log('ready');
  };

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

let NavigationBarRouteMapper = props => ({
  LeftButton(route, navigator, index, navState) {
    return (
      <View style={styles.backButtonView}>
        <TouchableOpacity style={styles.backButton}
            onPress={() => (props.state.showVideoPlayer && Platform.OS === 'ios') ? props.hideVideoPlayer() : navigator.parentNavigator.pop()}>
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
  /**
   * @return {null}
   */
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
    elevation: 2,
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
  // imagen poster del tv show
  poster: {
    marginTop: -86,
    height: 147,
    width: 100,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  // vista donde estan el titulo, año, content rating y generos del tv show
  headerData: {
    flex: 1,
    flexDirection: 'column',
    padding: 12,
    paddingTop: 0,
    paddingRight: 0,
    ...Platform.select({
      ios: {
        marginTop: -2
      },
      android: {
        marginTop: -8,
      }
    }),
  },
  tvShowTitle: {
    alignSelf: 'stretch',
    height: 22,
    fontSize: 17,
    color: '#eaeaea',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        fontWeight: '500',
        opacity: 0.9,
      },
      android: {
        fontFamily: 'Roboto-Medium',
        opacity: 0.8,
      }
    }),
  },
  tvShowSubtitle: {
    flexDirection: 'row',
    ...Platform.select({
      android: {
        marginTop: 3,
      }
    }),
  },
  tvShowSubtitleLeft: {
    flexDirection: 'column',
    maxWidth: 160,
  },
  tvShowYearRating: {
    color: '#bbbbc1',
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
  tvShowGenre: {
    color: '#bbbbc1',
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
  // vista donde están la puntuacion, runtime y network del tv show
  subtitleRight: {
    flex: 1,
    flexDirection: 'column',
    marginTop: -1
  },
  ratingText: {
    color: '#eaeaea',
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
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
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 6,
    backgroundColor: '#212121',
  },
  principalButtons: {
    backgroundColor: '#212121',
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
        marginBottom: 2,
      }
    }),
  },
  youtubeView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    zIndex: 2,
  },
  youtube: {
    alignSelf: 'stretch',
    height: 250,
    backgroundColor: 'black',
  },
  overview: {
    backgroundColor: '#212121',
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
  // contenido del pie: reparto, estado del tv show, y por ultimo, temporadas?
  footerContent: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    backgroundColor: '#212121',
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
    color: '#dadade',
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

export default TvShow;

import React, { Component } from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Alert,
  ScrollView,
  Animated,
  TouchableHighlight,
  AsyncStorage,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import ReadMore from '@expo/react-native-read-more-text';
import StarRatingBar from 'react-native-star-rating-view/StarRatingBar';

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
        moreTextReady: false,
        viewOpacity: 0,
        tvShowData: {},
        tvShowGenres: '',
        scoreAvg: 0,
        scorePersonal: 0,
        scrollY: new Animated.Value(0),
        posterOpacity: new Animated.Value(0),
        fanartOpacity: new Animated.Value(0),
        youtubeOpacity: new Animated.Value(0),
        showVideoPlayer: false,
        status: null,
        quality: null,
        error: null,
        isPlaying: false,
        voteModalVisible: false,
        starSize: 20,
        starValue: null,
        voteButtonsDisabled: false,
        voteModalBottomMessage: ' ',
        voteModalBottomMessageOpacity: new Animated.Value(0),
        voteModalLoading: false,
      }
    ) : (
      this.state = {
        userId: 0,
        userName: '',
        jwt: '',
        tvShowId: this.props.tvShowId,
        fetchEnded: false,
        moreTextReady: false,
        viewOpacity: 0,
        tvShowData: {},
        tvShowGenres: '',
        scoreAvg: 0,
        scorePersonal: 0,
        scrollY: new Animated.Value(0),
        posterOpacity: new Animated.Value(0),
        fanartOpacity: new Animated.Value(0),
        voteModalVisible: false,
        starSize: 20,
        starValue: null,
        voteButtonsDisabled: false,
        voteModalBottomMessage: ' ',
        voteModalBottomMessageOpacity: new Animated.Value(0),
        voteModalLoading: false,
      }
    );
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
      'http://localhost:9000/api/tvshows/' : 'http://192.168.1.13:9000/api/tvshows/';

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

  getTvShowVote() {
    // segun la plataforma, url
    const tvShowId = this.state.tvShowId;
    const route = 'api/tvshows/' + tvShowId + '/rating';
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/' + route : 'http://192.168.1.13:9000/' + route;

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
        if (responseData.error) {
          // ponemos null
          this.setState({scorePersonal: null, starValue: null});
        } else {
          // ponemos nota del usuario
          this.setState({scorePersonal: responseData.tvShowVote.score, starValue: responseData.tvShowVote.score});
        }
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

      // procesamos los generos
      this.setState({tvShowGenres : data.genre.join(', ').replace(/"/g, '')});

      // procesamos la nota personal del usuario
      this.getTvShowVote();

      // cargamos datos en el state
      this.setState({tvShowData: data});
    }
  }

  // mostrar u ocultar modal: mostrar/ocultar, titulo, mensaje, mostrar/ocultar spinner
  setVoteModalVisible(visible, loading) {
    this.setState({voteModalVisible: visible, voteModalBottomMessage: ' ', voteModalLoading: loading});
  }

  dismissVoteModal() {
    //e.preventDefault();
    this.setVoteModalVisible(false, false);
  };

  showVoteModal = (e) => {
    //e.preventDefault();
    this.setVoteModalVisible(true, false);
    // ponemos nota de usuario
    this.setState({starValue: this.state.scorePersonal })
  };

  hideVoteModalBottomMessage() {
    if (this.state.voteModalBottomMessageOpacity !== 0) {
      Animated.timing(this.state.voteModalBottomMessageOpacity, {
        toValue: 0,
        duration: 500
      }).start(() => {
        this.setState({ voteModalBottomMessage: ' ' });
        this.dismissVoteModal();
      });
    }
  }

  showVoteModalBottomMessage() {
    if (this.state.voteModalBottomMessageOpacity !== 1) {
      Animated.timing(this.state.voteModalBottomMessageOpacity, {
        toValue: 1,
        duration: 500
      }).start( () => setTimeout( () => { this.hideVoteModalBottomMessage() }, 2000) );
    }
  }

  setStarsSpacing = (e) => {
    console.log('Calculando spacing entre estrellas');
    const {x, y, width, height} = e.nativeEvent.layout;
    let modalWidth = width - 100 - 40; // anchura vista menos paddings
    const starWidth = this.state.starSize; // anchura estrellas
    let starSpacing = (modalWidth - (10 * starWidth)) / 10;
    this.setState({ starSpacing: starSpacing});
  };

  onStarValueChanged = (e) => {
    if (e !== this.state.value && e >= 0 && e <= 10) {
      this.setState({ starValue: e });
    }
  };

  saveVote = (e) => {
    console.log('guardar votación');
    // bloqueamos botones de guardar y eliminar votación
    if (this.state.voteButtonsDisabled) {
      // botones bloqueados
      console.log('Botones bloqueados');
    } else {
      // bloqueamos botones y mostramos activity indicator
      this.setState({ voteButtonsDisabled: true, voteModalLoading: true, voteModalBottomMessage: null});

      const route = 'api/tvshows/' + this.state.tvShowId + '/rating';
      const URL = (Platform.OS === 'ios') ?
        'http://localhost:9000/' + route : 'http://192.168.1.13:9000/' + route;

      let data = JSON.stringify({
        score: this.state.starValue,
      });

      // hacemos fetch a la API
      fetch(URL, {
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.jwt,
        },
        body: data,
      }).then((response) => response.json()
      ).then((responseData) => {
        // procesamos datos
        if (responseData.ok !== undefined && responseData.ok !== null) {
          this.setState({ scorePersonal: responseData.tvShowVote.score });
          // actualizamos datos serie
          this.getTvShow();
          this.setState({ voteButtonsDisabled: false, voteModalLoading: false, voteModalBottomMessage: 'Votación guardada'});
          this.showVoteModalBottomMessage();
        } else {
          // no se ha podido votar
          this.setState({ voteButtonsDisabled: false, voteModalLoading: false, voteModalBottomMessage: 'Error guardando la votación'});
          this.showVoteModalBottomMessage();
        }
      }).catch((error) => {
        console.log(error.stack);
        this.setState({ voteButtonsDisabled: false, voteModalLoading: false, voteModalBottomMessage: 'Error guardando la votación' });
        this.showVoteModalBottomMessage();
      });
    }
  };

  deleteVote = (e) => {
    console.log('borrar votación');
    // bloqueamos botones de guardar y eliminar votación
    if (this.state.voteButtonsDisabled) {
      // botones bloqueados
      console.log('Botones bloqueados');
    } else {
      // bloqueamos botones y mostramos activity indicator
      this.setState({ voteButtonsDisabled: true, voteModalLoading: true, voteModalBottomMessage: null});

      const route = 'api/tvshows/' + this.state.tvShowId + '/rating';
      const URL = (Platform.OS === 'ios') ?
        'http://localhost:9000/' + route : 'http://192.168.1.13:9000/' + route;

      // hacemos fetch a la API
      fetch(URL, {
        method: "DELETE",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.jwt,
        },
      }).then((response) => response.json()
      ).then((responseData) => {
        // procesamos datos
        if (responseData.ok !== undefined && responseData.ok !== null) {
          this.setState({ scorePersonal: null });
          // actualizamos datos serie
          this.getTvShow();
          // terminado
          this.setState({ voteButtonsDisabled: false, voteModalLoading: false, voteModalBottomMessage: 'Votación eliminada'});
          this.showVoteModalBottomMessage();
          console.log('votación eliminada');
        } else {
          // no se ha podido eliminar
          this.setState({ voteButtonsDisabled: false, voteModalLoading: false, voteModalBottomMessage: 'Ha habido un error eliminando la votación'});
          this.showVoteModalBottomMessage();
        }
      }).catch((error) => {
        console.log(error.stack);
        this.setState({ voteButtonsDisabled: false, voteModalLoading: false, voteModalBottomMessage: 'Ha habido un error eliminando la votación' });
        this.showVoteModalBottomMessage();
      });
    }
  };

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

    const LinearGradientAnimated = Animated.createAnimatedComponent(LinearGradient);

    return (
      (this.state.fetchEnded) ? (
        <View style={[styles.container, {opacity: this.state.viewOpacity}]} onLayout={ this.setStarsSpacing }>{/* contenedor total incluyendo modals, etc */}

          <Modal
            animationType={'fade'}
            transparent
            onRequestClose={ this.dismissVoteModal.bind(this) }
            visible={this.state.voteModalVisible}
          >
            <TouchableWithoutFeedback style={styles.voteModalOutside} onPress={ this.dismissVoteModal.bind(this) }>
              <View style={styles.voteModal}>
                <TouchableWithoutFeedback style={styles.voteInnerModalTouchable}>
                  <View style={styles.voteInnerModal}>
                    <Icon style={styles.closeModal}
                          name={(Platform.OS === 'ios') ? 'ios-close-outline' : 'md-close'}
                          onPress={ this.dismissVoteModal.bind(this) } />
                    <Text style={styles.voteModalTitle}>Votar serie</Text>
                    <Text style={styles.voteModalTitleName}>{this.state.tvShowData.name}</Text>
                    <Image style={styles.voteModalPoster} source={this.state.tvShowData.poster !== null ? {uri: this.state.tvShowData.poster} : require('./img/placeholderPoster.png')} />
                    <Text style={styles.voteModalMessage}>Tu valoración</Text>
                    <Text style={styles.voteModalNumber}>{(this.state.starValue === null ? '-' : this.state.starValue)}</Text>
                    <View style={styles.starRating}>
                      <StarRatingBar
                        readOnly={false}
                        continuous={true}
                        score={this.state.starValue}
                        maximumValue={10}
                        spacing={this.state.starSpacing}
                        starStyle={{width: this.state.starSize, height: this.state.starSize}}
                        tintColor={'rgba(90,200,250,1)'}
                        onStarValueChanged={ this.onStarValueChanged }
                      />
                    </View>
                    {(Platform.OS === 'ios') ?
                      <View style={styles.saveVoteButtonView}>
                        <TouchableHighlight style={(this.state.starValue !== null ? styles.saveVoteButton : styles.saveVoteButtonDisabled)}
                                            onPress={(this.state.starValue !== null ? this.saveVote : null)} underlayColor={'rgba(255,179,0,1)'}>
                          <Text style={styles.saveVoteButtonText}>Guardar voto</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={[(this.state.scorePersonal !== null ? styles.deleteVoteButton : styles.deleteVoteButtonDisabled), styles.lastItem]}
                                            onPress={(this.state.scorePersonal !== null ? this.deleteVote : null)} underlayColor={'rgba(255,179,0,0.6)'}>
                          <Text style={styles.saveVoteButtonText}>Eliminar voto</Text>
                        </TouchableHighlight>
                      </View>
                      :
                      <View style={styles.saveVoteButtonView}>
                        <TouchableNativeFeedback
                          onPress={(this.state.starValue !== null ? this.saveVote : null)}
                          delayPressIn={0}
                          background={(this.state.starValue !== null ? TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true) : TouchableNativeFeedback.Ripple('rgba(255,224,130,0)', true))}>
                          <View style={(this.state.starValue !== null ? styles.saveVoteButton : styles.saveVoteButtonDisabled)}>
                            <Text style={styles.saveVoteButtonText}>Guardar voto</Text>
                          </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                          onPress={(this.state.scorePersonal !== null ? this.deleteVote : null)}
                          delayPressIn={0}
                          background={(this.state.starValue !== null ? TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true) : TouchableNativeFeedback.Ripple('rgba(255,224,130,0)', true))}>
                          <View style={[(this.state.scorePersonal !== null ? styles.deleteVoteButton : styles.deleteVoteButtonDisabled), styles.lastItem]}>
                            <Text style={styles.saveVoteButtonText}>Eliminar voto</Text>
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    }
                    <View style={styles.voteModalBottom}>
                      {(this.state.voteModalLoading) ? (
                        <View>
                          <ActivityIndicator style={styles.modalLoader}
                                             size={'small'} color={'rgba(255,149,0,1)'} />
                          <Animated.Text style={styles.voteModalBottomMessage}>{this.state.voteModalBottomMessage}</Animated.Text>
                        </View>
                      ) : (
                        <Animated.Text style={[styles.voteModalBottomMessage, {opacity: this.state.voteModalBottomMessageOpacity}]}>{this.state.voteModalBottomMessage}</Animated.Text>
                      )}
                    </View>

                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* contenedor de la vista */}
          <View style={styles.containerDark}>
            <Icon style={styles.backIcon} onPress={ this.onBackPress.bind(this, navigator) }
                  name={(Platform.OS === 'ios') ? 'ios-arrow-back-outline' : 'md-arrow-back'} />

            <View style={styles.navButtons}>

              <View style={styles.linearGradientContainer}>
                <LinearGradientAnimated style={[styles.topBarOverlay, {opacity: topBarOpacity}]}
                                        colors={['#000', 'transparent']} />
              </View>

            </View>

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
                  <View style={styles.scores}>
                    {(this.state.tvShowData.voteCount === 0) ? (
                      <View style={styles.scoreAvg}>
                        <View style={styles.iconView}><Icon style={styles.scoreAvgStar} name={(Platform.OS === 'ios') ? 'ios-star-outline' : 'md-star-outline'} /></View>
                        <Text style={styles.scoreAvgTextNull}>Sin votos</Text>
                      </View>
                    ) : (
                      <View style={styles.scoreAvg}>
                        <View style={styles.iconView}><Icon style={styles.scoreAvgStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} /></View>
                        <Text style={styles.scoreAvgText}> {this.state.tvShowData.score} <Text style={styles.scoreAvgTextNull}>({this.state.tvShowData.voteCount})</Text></Text>
                      </View>
                    )}

                    {(this.state.scorePersonal === null) ? (
                      (Platform.OS === 'ios') ? (
                        <View style={styles.scorePersonal}>
                          <TouchableHighlight style={styles.scorePersonal} onPress={ this.showVoteModal } underlayColor={'rgba(255,179,0,0.5)'}>
                            <View style={styles.insideButton}>
                              <View style={styles.iconView}><Icon style={styles.scorePersonalStarNull} name={'ios-star-outline'} /></View>
                              <Text style={styles.scorePersonalTextNull}>Vota</Text>
                            </View>
                          </TouchableHighlight>
                        </View>
                      ) : (
                        <View style={styles.scorePersonal}>
                          <TouchableNativeFeedback
                            onPress={ this.showVoteModal }
                            delayPressIn={0}
                            background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                            <View style={styles.insideButton}>
                              <View style={styles.iconView}><Icon style={styles.scorePersonalStarNull} name={'md-star-outline'} /></View>
                              <Text style={styles.scorePersonalTextNull}>Vota</Text>
                            </View>
                          </TouchableNativeFeedback>
                        </View>
                      )
                    ) : (
                      (Platform.OS === 'ios') ? (
                        <View style={styles.scorePersonal}>
                          <TouchableHighlight style={styles.scorePersonal} onPress={ this.showVoteModal } underlayColor={'rgba(255,179,0,0.5)'}>
                            <View style={styles.insideButton}>
                              <View style={styles.iconView}><Icon style={styles.scorePersonalStar} name={'ios-star'} /></View>
                              <Text style={styles.scorePersonalText}>{this.state.scorePersonal}</Text>
                            </View>
                          </TouchableHighlight>
                        </View>
                      ) : (
                        <View style={styles.scorePersonal}>
                          <TouchableNativeFeedback
                            onPress={ this.showVoteModal }
                            delayPressIn={0}
                            background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                            <View style={styles.insideButton}>
                              <View style={styles.iconView}><Icon style={styles.scorePersonalStar} name={'md-star'} /></View>
                              <Text style={styles.scorePersonalText}>{this.state.scorePersonal}</Text>
                            </View>
                          </TouchableNativeFeedback>
                        </View>
                      )
                    )}
                  </View>

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

        </View>
      ) : (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator style={styles.loader} size={'large'} color={'rgba(255,149,0,1)'} />
        </View>
      )
    );
  }

  // pie del resumen de la serie (leer mas)
  overviewReady = () => {
    console.log('overview ready');
    this.setState({ moreTextReady: true, viewOpacity: 1 });
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
    height: 56,
    left: 0,
    top: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  backIcon: {
    position: 'absolute',
    zIndex: 3,
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
  scores: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 8,
  },
  scoreAvg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreAvgText: {
    color: 'rgba(255,255,255,0.9)',
  },
  scoreAvgTextNull: {
    color: 'rgba(255,255,255,0.4)'
  },
  iconView: {
    alignItems: 'center',
    marginRight: 8
  },
  scoreAvgStar: {
    fontSize: 24,
    color: 'rgba(255,204,0,1)',
  },
  scorePersonal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  scorePersonalText: {
    color: 'rgba(255,255,255,0.9)'
  },
  scorePersonalTextNull:{
    color: 'rgba(255,255,255,0.4)'
  },
  scorePersonalStar: {
    fontSize: 24,
    color: 'rgba(90,200,250,1)'
  },
  scorePersonalStarNull: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.3)'
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
  voteModal: {
    flex: 1,
    padding: 50,
    backgroundColor: 'rgba(23,23,23,0.9)',
    justifyContent: 'center',
  },
  voteInnerModalTouchable: {
    borderRadius: 10,
    alignItems: 'center',
  },
  voteInnerModal: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#212121',
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
  closeModal: {
    position: 'absolute',
    right: 20,
    top: 16,
    zIndex: 2,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 26,
    ...Platform.select({
      android: {
        top: 22,
        fontSize: 20,
      },
    }),
  },
  voteModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    marginBottom: 10,
  },
  voteModalTitleName: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,1)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  voteModalPoster: {
    alignSelf: 'center',
    height: 147,
    width: 100,
    marginVertical: 10,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  voteModalNumber: {
    textAlign: 'center',
    fontSize: 40,
    color: 'white',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  voteModalMessage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  voteModalBottom: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 9,
    paddingBottom: 8
  },
  voteModalBottomMessage: {
    position: 'absolute',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
  },
  modalLoader: {
    position: 'absolute',
    padding: 0,
  },
  // slider de puntuación
  starRating: {
    flex: 0,
    flexDirection: 'row',
    height: 30,
    paddingLeft: 3,
  },
  saveVoteButtonView: {
    flexDirection: 'row',
    marginTop: 8,
    alignSelf: 'stretch',
    borderRadius: 3,
    elevation: 3,
  },
  saveVoteButton: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 3,
    padding: 8,
    marginRight: 6,
    backgroundColor: 'rgba(255,149,0,1)',
  },
  saveVoteButtonDisabled: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 3,
    padding: 8,
    marginRight: 6,
    backgroundColor: 'rgba(255,149,0,1)',
    opacity: 0.4
  },
  deleteVoteButton: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 3,
    padding: 8,
    marginRight: 6,
    backgroundColor: 'rgba(77,77,77,1)',
  },
  deleteVoteButtonDisabled: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 3,
    padding: 8,
    marginRight: 6,
    backgroundColor: 'rgba(77,77,77,1)',
    opacity: 0.4
  },
  lastItem: {
    marginRight: 0,
  },
  saveVoteButtonText: {
    color: 'rgba(255,255,255,0.87)',
    textAlign: 'center',
    fontSize: 14,
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
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

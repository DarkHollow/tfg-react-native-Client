import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableHighlight,
  Image,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

/* Constantes de URLs */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';

const ANIMATION_DURATION = 500;
const HEIGHT = 123;

class myShowsListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      jwt: props.jwt,
    };

    this.animated = new Animated.Value(0);
    this.opacity = new Animated.Value(0);
    this.height = new Animated.Value(HEIGHT);
    this.followIconColor = props.following ? new Animated.Value(1) : new Animated.Value(0);
    this.personalScore = null;
    this.personalScoreOpacity = new Animated.Value(0);
    this.fetchEnded = false;
  }

  componentWillMount() {
    this.getTvShowVote();
  }

  componentDidMount() {
    Animated.timing(this.animated, {
      toValue: 1,
      duration: ANIMATION_DURATION,
    }).start(() => this.showPersonaScore());
    Animated.timing(this.opacity, {
      toValue: 1,
      duration: ANIMATION_DURATION,
    }).start();
  }

  /* redirige a la vista de ficha de tv show */
  openTvShow(tvShowId) {
    console.log('Ver TV Show con id:' + tvShowId);
    this.props.navigator.push({
      name: 'tvshow',
      passProps: {
        tvShowId: tvShowId,
        backButtonText: 'myShows'
      }
    });
  }

  getTvShowVote() {
    // segun la plataforma, url
    const tvShowId = this.props.id;
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
          this.personalScore = null;
        } else {
          // ponemos nota del usuario
          this.personalScore = responseData.tvShowVote.score;
          this.fetchEnded = true;
          // animamos opacidad

        }
      }).catch((error) => {
        console.log(error.stack);
        this.errorAndPop();
    });
  }

  showPersonaScore() {
    setTimeout(() => {
      Animated.timing(this.personalScoreOpacity, {
        delay: 0,
        duration: 250,
        toValue: 1,
      }).start();
    }, 300);

  }

  /* boton follow */
  following() {
    const { following } = this.props;
    if (following) {
      // dejar de seguir
      this.followingFetch('DELETE');
    } else {
      // seguir
      this.followingFetch('PUT');
    }
  }

  followingFetch(method) {
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/tvshows/' : 'http://192.168.1.13:9000/api/tvshows/';
    const ACTION = '/following';
    const tvShowId = this.props.id;

    // hacemos fetch a la API
    fetch(URL + tvShowId + ACTION, {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + this.state.jwt,
      }
    }).then(function (response) {
      if (response.status === 204) {
        this.followAnimations(method);
      } else {
        // mal: mostrar toast ?
      }
    }.bind(this)).catch((error) => {
      console.log(error.stack);
      // mostrar toast ?
    });
  }

  followAnimations(method) {
    let toValue = 0;
    let toastMessage = 'Serie no seguida';

    Animated.parallel([
      Animated.timing(this.followIconColor, {
        delay: 0,
        duration: 300,
        toValue: toValue,
      }),
      Animated.timing(this.opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }),
      Animated.timing(this.height, {
        toValue: 0,
        duration: ANIMATION_DURATION,
      }),
    ]).start(() => this.resetThings());

    // toast
    //this.refs.toast.show(toastMessage, 2000);
  }

  resetThings() {
    Animated.parallel([
      Animated.timing(this.followIconColor, {
        delay: 0,
        duration: 1,
        toValue: 1,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 1,
      }),
      Animated.timing(this.height, {
        toValue: 123,
        duration: 1,
      }),
    ]).start(() => this.onRemove());
  }

  onRemove = () => {
    const { onRemove } = this.props;
    if (onRemove) {
      onRemove();
    }
  };

  render() {
    const verticalPosition = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: 'clamp',
    });
    const opacity = this.opacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const height = this.height.interpolate({
      inputRange: [0, 123],
      outputRange: [0, 123],
      extrapolate: 'clamp',
    });

    /* MCIcon animado */
    const AnimatedMCIcon = Animated.createAnimatedComponent(MCIcon);
    /* calculo color boton follow */
    const followIconColor = this.followIconColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255,255,255,0.36)', 'rgba(76,217,100,0.90)'],
    });

    const { id, poster, name, score, voteCount, following, unseenCount } = this.props;
    const personalScore = this.personalScore;

    let fixedScore;
    // procesamos nota media
    if (voteCount === 0) {
      fixedScore = '-';
    } else if (score === 10) {
      fixedScore = 10;
    } else {
      fixedScore = score.toFixed(1);
    }

    return (
      <Animated.View style={
        [
          {
            backgroundColor: this.props.backgroundColor,
            borderRadius: this.props.borderRadius,
            opacity: opacity,
            marginTop: verticalPosition,
            height: height,
          },
          styles.externalView,
          this.props.style,
        ]
      }>
        {Platform.OS === 'ios' ? (
          <TouchableOpacity disabled={this.props.disabled}
                            onPress={this.props.onPress}
                            style={
                              [
                                {
                                  borderRadius: this.props.borderRadius,
                                  borderColor: (this.props.disabled) ? 'rgba(255, 255, 255, 0.2)' : this.props.iconColor,
                                },
                                styles.touchableOpacity,
                              ]
                            }>
            <View style={
              [
                {
                  backgroundColor: 'transparent'
                },
                styles.interiorView,
              ]
            }>
              <Image style={
                [
                  {
                    height: this.props.imageHeight,
                    width: this.props.imageWidth,
                    resizeMode: this.props.resizeMode,
                  },
                  styles.poster
                ]
              }
                     source={poster !== null && poster !== undefined ? {uri: (URLSERVER + poster.substring(2))} : require('../img/placeholderPoster.png')}
              />
              <View style={[{width: this.props.width,}, styles.titleAndSubtitle,]}>
                <Text numberOfLines={1} style={
                  [
                    {
                      fontSize: this.props.titleSize,
                      color: this.props.titleColor,
                    },
                    styles.title,
                  ]
                }>{this.props.subtitleLeft} {name}
                </Text>

                <View style={styles.ratingView}>
                  <View style={styles.scoreView}>
                    <Icon style={styles.scoreAvgStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                    <Text style={styles.score}>{fixedScore}</Text>
                  </View>
                  {this.personalScore !== undefined && this.personalScore !== null ? (
                    <Animated.View style={[styles.personalScoreView, {opacity: this.personalScoreOpacity}]}>
                      <Icon style={styles.personalScoreStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                      <Text style={styles.score}>{personalScore}</Text>
                    </Animated.View>
                  ) : (
                    null
                  )}
                </View>
              </View>
              <View style={styles.footerView}>
                {following ? unseenCount > 0 ?
                  (<View style={styles.posterUnseen}>
                    <Text style={styles.posterUnseenText}>{this.props.unseenCount}</Text>
                  </View>)
                  : null : null}
                <TouchableHighlight style={styles.followIconView}
                                    onPress={this.following.bind(this)}
                                    underlayColor={'rgba(255,179,0,0.5)'}>
                  <AnimatedMCIcon
                    style={[following ? styles.bookmarkCheck : styles.bookmarkPlus, {color: followIconColor}]}
                    name={following ? 'bookmark-check' : 'bookmark-plus'} />
                </TouchableHighlight>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableNativeFeedback
            disabled={this.props.disabled}
            useForeground={this.props.useForeground}
            background={TouchableNativeFeedback.Ripple(this.props.opacityColor, true)}
            onPress={this.props.onPress}
          >
            <View style={
              [
                {
                  backgroundColor: 'transparent'
                },
                styles.interiorView,
              ]
            }>
              <Image style={
                  [
                    {
                      height: this.props.imageHeight,
                      width: this.props.imageWidth,
                      resizeMode: this.props.resizeMode,
                      zIndex: -3,
                    },
                    styles.poster,
                  ]
                }
                      source={poster !== null && poster !== undefined ? {uri: (URLSERVER + poster.substring(2))} : require('../img/placeholderPoster.png')}
              />
              <View style={[{width: this.props.width,}, styles.titleAndSubtitle,]}>
                <Text numberOfLines={1} style={
                  [
                    {
                      fontSize: this.props.titleSize,
                      color: this.props.titleColor,
                    },
                    styles.title,
                  ]
                }>{this.props.subtitleLeft} {name}
                </Text>

                <View style={styles.ratingView}>
                  <View style={styles.scoreView}>
                    <Icon style={styles.scoreAvgStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                    <Text style={styles.score}>{fixedScore}</Text>
                  </View>
                  {this.personalScore !== undefined && this.personalScore !== null ? (
                    <Animated.View style={[styles.personalScoreView, {opacity: this.personalScoreOpacity}]}>
                      <Icon style={styles.personalScoreStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                      <Text style={styles.score}>{personalScore}</Text>
                    </Animated.View>
                  ) : (
                    null
                  )}
                </View>
              </View>
              <View style={styles.footerView}>
                <TouchableNativeFeedback
                  onPress={this.following.bind(this)}
                  delayPressIn={0}
                  background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                  <View style={styles.followIconView}>
                    <AnimatedMCIcon
                      style={[following ? styles.bookmarkCheck : styles.bookmarkPlus, {color: followIconColor}]}
                      name={following ? 'bookmark-check' : 'bookmark-plus'} />
                  </View>
                </TouchableNativeFeedback>
              </View>
            </View>
          </TouchableNativeFeedback>
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  externalView: {
    margin: 4,
    borderRadius: 1,
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  interiorView: {
    flexDirection: 'row',
    padding: 10,
  },
  touchableOpacity: {
  },
  poster: {
    alignSelf: 'center',
    borderRadius: 1,
  },
  posterUnseen: {
    alignSelf: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255,149,0,0.76)',
    paddingRight: 8,
    paddingLeft: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: { width: 0, height: 0},
        shadowOpacity: 0.6,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  posterUnseenText: {
    color: 'rgba(255,255,255,1)',
    textShadowOffset: { width: 1, height: 1},
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowRadius: 3,
    ...Platform.select({
      ios: {
        fontSize: 13,
        lineHeight: 24,
        fontWeight: '600',
      },
      android: {
        fontSize: 13,
        lineHeight: 20,
        paddingBottom: 3,
        fontFamily: 'Roboto-Medium',
      }
    }),
  },
  titleAndSubtitle: {
    padding: 8,
    paddingLeft: 20,
    alignSelf: 'center',
  },
  title: {
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  subtitleView: {
    flexDirection: 'row',
  },
  subtitleLeft: {
    ...Platform.select({
      ios: {
        fontWeight: '400',
      },
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    fontSize: 15,
  },
  subtitleRight: {
    marginLeft: 14,
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    fontSize: 13,
    alignSelf: 'center',
  },
  ratingView: {
    flexDirection: 'row',
  },
  scoreView: {
    flexDirection: 'row',
    marginTop: 4,
  },
  scoreAvgStar: {
    fontSize: 18,
    color: 'rgba(255,204,0,1)',
  },
  score: {
    paddingLeft: 2.5,
    alignSelf: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.76)',
    ...Platform.select({
      ios: {
        fontWeight: '600',
        paddingTop: 0.5,
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  personalScoreView: {
    flexDirection: 'row',
    marginLeft: 16,
    marginTop: 4,
  },
  personalScoreStar: {
    fontSize: 18,
    color: 'rgba(90,200,250,1)',
  },
  footerView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  followIconView: {
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: 'center',
    padding: 3,
  },
  bookmarkPlus: {
    fontSize: 36,
  },
  bookmarkCheck: {
    fontSize: 36,
  },
  followText: {
    color: 'rgba(255,255,255,0.3)',
  },
});

export default myShowsListItem;

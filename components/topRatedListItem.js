import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableNativeFeedback,
  Image,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ANIMATION_DURATION = 500;

class topRatedListItem extends Component {
  constructor(props) {
    super(props);
    this.animated = new Animated.Value(0);

    let score;
    // procesamos nota media
    if (props.voteCount === 0) {
      score = '-';
    } else if (props.score === 10) {
      score = 10;
    } else {
      score = props.score.toFixed(1);
    }

    this.state = {
      modalVisible: false,
      score: score,
      scorePersonal: null,
      jwt: props.jwt,
    }
  }

  componentWillMount() {
    this.getTvShowVote();
  }

  componentDidMount() {
    Animated.timing(this.animated, {
      toValue: 1,
      duration: ANIMATION_DURATION,
    }).start();
  }

  getTvShowVote() {
    // segun la plataforma, url
    const tvShowId = this.props.tvShowId;
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
          this.setState({scorePersonal: null});
        } else {
          // ponemos nota del usuario
          this.setState({scorePersonal: responseData.tvShowVote.score});
        }
      }).catch((error) => {
      console.log(error.stack);
      this.errorAndPop();
    });
  }

  render() {
    const verticalPosition = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={
        [
          {
            height: this.props.height,
            backgroundColor: this.props.backgroundColor,
            borderRadius: this.props.borderRadius,
            opacity: this.animated,
            marginTop: verticalPosition,
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
                  width: this.props.width,
                  height: this.props.height,
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
                     source={this.props.source}
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
                }>{this.props.subtitleLeft} {this.props.title}
                </Text>

                <View style={styles.ratingView}>
                  <View style={styles.scoreView}>
                    <Icon style={styles.scoreAvgStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                    <Text style={styles.score}>{this.state.score}</Text>
                  </View>
                  {this.state.scorePersonal !== undefined && this.state.scorePersonal !== null ? (
                    <View style={styles.personalScoreView}>
                      <Icon style={styles.personalScoreStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                      <Text style={styles.score}>{this.state.scorePersonal}</Text>
                    </View>
                  ) : (
                    null
                  )}
                </View>
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
                  width: this.props.width,
                  height: this.props.height,
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
                 source={this.props.source}
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
                }>{this.props.subtitleLeft} {this.props.title}
                </Text>

                <View style={styles.ratingView}>
                  <View style={styles.scoreView}>
                    <Icon style={styles.scoreAvgStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                    <Text style={styles.score}>{this.state.score}</Text>
                  </View>
                  {this.state.scorePersonal !== undefined && this.state.scorePersonal !== null ? (
                    <View style={styles.personalScoreView}>
                      <Icon style={styles.personalScoreStar} name={(Platform.OS === 'ios') ? 'ios-star' : 'md-star'} />
                      <Text style={styles.score}>{this.state.scorePersonal}</Text>
                    </View>
                  ) : (
                    null
                  )}
                </View>
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
});

export default topRatedListItem;

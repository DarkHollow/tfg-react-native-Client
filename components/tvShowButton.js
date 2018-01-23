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

const ANIMATION_DURATION = 500;

class tvShowButton extends Component {
  constructor(props) {
    super(props);
    this.animated = new Animated.Value(0);
  }

  componentDidMount() {
    Animated.timing(this.animated, {
      toValue: 1,
      duration: ANIMATION_DURATION,
    }).start();
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
            width: this.props.width,
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
                }>{this.props.title}
                </Text>
                <View style={styles.subtitleView}>
                  <Text style={
                    [
                      {
                        fontSize: this.props.subtitleLeftSize,
                        color: this.props.subtitleLeftColor,
                      },
                      styles.subtitleLeft,
                    ]
                  }>{this.props.subtitleLeft}
                  </Text>
                  <Text style={
                    [
                      {
                        fontSize: this.props.subtitleRightSize,
                        color: this.props.subtitleRightColor,
                      },
                      styles.subtitleRight,
                    ]
                  }>{this.props.subtitleRight}
                  </Text>
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
                }>{this.props.title}
                </Text>
                <View style={styles.subtitleView}>
                  <Text style={
                    [
                      {
                        fontSize: this.props.subtitleLeftSize,
                        color: this.props.subtitleLeftColor,
                      },
                      styles.subtitleLeft,
                    ]
                  }>{this.props.subtitleLeft}
                  </Text>
                  <Text style={
                    [
                      {
                        fontSize: this.props.subtitleRightSize,
                        color: this.props.subtitleRightColor,
                      },
                      styles.subtitleRight,
                    ]
                  }>{this.props.subtitleRight}
                  </Text>
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
    padding: 0,
    marginRight: 4,
    borderRadius: 1,
  },
  interiorView: {
  },
  touchableOpacity: {
  },
  poster: {
    alignSelf: 'center',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  titleAndSubtitle: {
    padding: 8,
    paddingLeft: 4,
  },
  title: {
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  subtitleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subtitleLeft: {
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  subtitleRight: {
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    fontSize: 11,
    alignSelf: 'center',
  },
});

export default tvShowButton;
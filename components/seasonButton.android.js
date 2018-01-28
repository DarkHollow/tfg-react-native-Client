import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Image,
  Platform,
} from 'react-native';

class seasonButton extends Component {
  render() {
    return (
      <View style={
        [
          {
            width: this.props.width,
            height: this.props.height,
            backgroundColor: this.props.backgroundColor,
            borderRadius: this.props.borderRadius,
          },
          styles.externalView,
          this.props.style,
        ]
      }>
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
                    zIndex: -3
                  }
                ]
              }
                 source={this.props.source}
            >
              {this.props.unseenCount !== null ? this.props.unseenCount > 0 ?
                (<View style={styles.posterUnseen}>
                  <Text style={styles.posterUnseenText}>{this.props.unseenCount}</Text>
                </View>)
                : null : null}
            </Image>
            <View style={styles.titleAndSubtitle}>
              <Text style={
                  [
                    {
                      fontSize: this.props.titleSize,
                      color: this.props.titleColor,
                    },
                    styles.title,
                  ]
                }>{this.props.title}
              </Text>
              <Text style={
                  [
                    {
                      fontSize: this.props.subtitleSize,
                      color: this.props.subtitleColor,
                    },
                    styles.subtitle,
                  ]
                }>{this.props.subtitle}
              </Text>
            </View>
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  externalView: {
    padding: 2,
    marginRight: 2,
  },
  interiorView: {
  },
  touchableOpacity: {
  },
  titleAndSubtitle: {
    padding: 8,
    paddingLeft: 4,
  },
  title: {
    fontFamily: 'Roboto-Medium',
  },
  subtitle: {
    fontFamily: 'Roboto-Medium',
  },
  posterUnseen: {
    alignSelf: 'flex-end',
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
        fontWeight: 'Roboto-Medium',
      }
    }),
  },
});

export default seasonButton;

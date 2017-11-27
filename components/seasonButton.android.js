import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Platform,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
          background={TouchableNativeFeedback.Ripple(this.props.opacityColor, true)}
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
            />
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
});

export default seasonButton;

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
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
        </TouchableOpacity>
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
    fontWeight: '500',
  },
  subtitle: {
    fontWeight: '500',
  },
});

export default seasonButton;

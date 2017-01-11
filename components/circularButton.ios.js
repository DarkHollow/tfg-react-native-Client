import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class circularButton extends Component {
  render() {
    return (
      <View style={
        [
          {
            width: this.props.size,
            height: this.props.size,
            backgroundColor: this.props.backgroundColor,
            borderRadius: this.props.size,
          },
          styles.externalView,
          this.props.style,
        ]
      }>
      <TouchableOpacity disabled={this.props.disabled} style={
          [
            {
              borderRadius: this.props.size,
              borderColor: (this.props.disabled) ? 'rgba(255, 255, 255, 0.2)' : this.props.iconColor,
            },
            styles.touchableOpacity,
          ]
      }>
        <View style={
          [
            {
              width: this.props.size,
              height: this.props.size,
              backgroundColor: 'transparent'
            },
            styles.interiorView,
          ]
        }>
          <Icon style={
            [
              {
                fontSize: this.props.iconSize,
                color: (this.props.disabled) ? 'rgba(255, 255, 255, 0.2)' : this.props.iconColor,
              },
              styles.icon,
            ]}
            name={this.props.icon}
          />
        </View>
      </TouchableOpacity>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  externalView: {
  },
  interiorView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchableOpacity: {
    borderWidth: 1,
  },
  icon: {
    paddingRight: 2,
  },
});

export default circularButton;

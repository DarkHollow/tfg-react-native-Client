import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class circularButton extends Component {

  checkAndOpenLink(url) {
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        console.log('Error: no podemos linkear la url - ' + url);
      } else {
        return Linking.openURL(url);
      }
    }).catch(err => console.error('Ha ocurrido un error linkeando', err));
  }

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

        <TouchableNativeFeedback
          disabled={this.props.disabled}
          background={TouchableNativeFeedback.Ripple(this.props.opacityColor, true)}
          onPress={(this.props.link) ? () => this.checkAndOpenLink(this.props.onPress) : this.props.onPress}
        >
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
        </TouchableNativeFeedback>
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
  icon: {
    paddingRight: 2,
    paddingBottom: 2,
  },
});

export default circularButton;

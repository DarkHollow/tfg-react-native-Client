import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Text,
  Platform,
  ViewPropTypes as RNViewPropTypes,
} from 'react-native'

const ViewPropTypes = RNViewPropTypes || View.propTypes;

export const DURATION = {
  LENGTH_LONG: 2000,
  LENGTH_SHORT: 500,
  FOREVER: 0,
};

const {height, width} = Dimensions.get('window');

const defaultPositionValue = Platform.OS === 'ios' ? 92 : 72;

export default class Toast extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isShow: false,
      text: '',
      opacityValue: new Animated.Value(0),
    }
  }

  show(text, duration) {
    this.duration = typeof duration === 'number' ? duration : DURATION.LENGTH_SHORT;

    this.setState({
      isShow: true,
      text: text,
    });

    Animated.timing(
      this.state.opacityValue,
      {
        toValue: this.props.opacity,
        duration: this.props.fadeInDuration,
      }
    ).start(() => {
      this.isShow = true;
      if(duration !== DURATION.FOREVER) this.close();
    });
  }

  close( duration ) {
    let delay = typeof duration === 'undefined' ? this.duration : duration;

    if(delay === DURATION.FOREVER) delay = this.props.defaultCloseDelay || 250;

    if (!this.isShow && !this.state.isShow) return;
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      Animated.timing(
        this.state.opacityValue,
        {
          toValue: 0.0,
          duration: this.props.fadeOutDuration,
        }
      ).start(() => {
        this.setState({
          isShow: false,
        });
        this.isShow = false;
      });
    }, delay);
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  render() {
    let pos;
    switch (this.props.position) {
      case 'top':
        pos = this.props.positionValue;
        break;
      case 'center':
        pos = height / 2;
        break;
      case 'bottom':
        pos = height - this.props.positionValue;
        break;
    }

    return this.state.isShow ?
      <View
        style={[styles.container, {top: pos}]}
        pointerEvents="none"
      >
        <Animated.View
          style={[styles.content, {opacity: this.state.opacityValue}, this.props.style]}
        >
          <Text style={this.props.textStyle}>{this.state.text}</Text>
        </Animated.View>
      </View> : null;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    elevation: 999,
    alignItems: 'center',
    zIndex: 10000,
  },
  content: {
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 21,
    padding: 24,
    paddingTop: 15,
    paddingBottom: 14,
  },
  text: {
    color: 'rgba(0,0,0,0.95)',
  }
});

Toast.propTypes = {
  style: ViewPropTypes.style,
  position: PropTypes.oneOf([
    'top',
    'center',
    'bottom',
  ]),
  textStyle: Text.propTypes.style,
  positionValue:PropTypes.number,
  fadeInDuration:PropTypes.number,
  fadeOutDuration:PropTypes.number,
  opacity:PropTypes.number
};

Toast.defaultProps = {
  position: 'bottom',
  textStyle: styles.text,
  positionValue: defaultPositionValue,
  fadeInDuration: 500,
  fadeOutDuration: 500,
  opacity: 1
};
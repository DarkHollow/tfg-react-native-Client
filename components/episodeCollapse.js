import React, {Component} from 'react';
import {Animated, Image, Platform, StyleSheet, Text, View, TouchableOpacity, TouchableNativeFeedback} from 'react-native';

class EpisodeCollapse extends Component {
  constructor(props) {
    super(props);

    this.state = {
      index      : props.index,
      number     : props.number,
      name       : props.title,
      screenshot : props.screenshot,
      date       : props.date,
      expanded   : false,
      animation  : new Animated.Value(),
    };
  }

  toggle(){
    let initialValue = this.state.expanded ? this.state.maxHeight + this.state.minHeight : this.state.minHeight;
    let finalValue   = this.state.expanded ? this.state.minHeight : this.state.maxHeight + this.state.minHeight;

    this.setState({
      expanded: !this.state.expanded,
    });

    this.state.animation.setValue(initialValue);
    Animated.spring(this.state.animation, {
      toValue: finalValue,
    }).start();
  }

  _setMaxHeight(event) {
    if (!this.state.maxHeight) {
      this.setState({
        maxHeight: event.nativeEvent.layout.height,
      });
    }
  }

  _setMinHeight(event){
    if (!this.state.minHeight) {
      this.setState({
        minHeight: event.nativeEvent.layout.height,
        animation: new Animated.Value(event.nativeEvent.layout.height),
      });
    }
  }

  render() {

    return (
      (Platform.OS === 'ios') ? (
        <Animated.View style={[(this.state.expanded) ? styles.episodeExpanded : styles.episode, {height: this.state.animation}]}>
          <TouchableOpacity style={styles.episode} onPress={this.toggle.bind(this)}>

            <View style={styles.episodeInner} onLayout={this._setMinHeight.bind(this)}>
              <View style={styles.episodeScreenshotView}>
                <Image style={styles.episodeScreenshot}
                       source={this.props.screenshot} />
              </View>
              <View style={styles.episodeNameNumber}>
                <Text style={styles.episodeName} numberOfLines={1}>{this.props.name}</Text>
                <View style={styles.episodeSubtitle}>
                  <Text style={styles.episodeNumber}>Episodio {this.props.number}</Text>
                  <Text style={styles.episodeDate}>{this.props.date}</Text>
                </View>
              </View>
              <View style={styles.episodeOption}>
              </View>
            </View>

          </TouchableOpacity>
          <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
            {this.props.children}
          </View>
        </Animated.View>

      ) : (
          <Animated.View style={[(this.state.expanded) ? styles.episodeExpanded : styles.episode, {height: this.state.animation}]}>
            <TouchableNativeFeedback onLayout={this._setMinHeight.bind(this)}
              onPress={this.toggle.bind(this)}
              background={TouchableNativeFeedback.Ripple('rgba(255,149,0,1)', true)}
              useForeground>

              <View style={styles.episodeInner}>
                <View style={styles.episodeScreenshotView}>
                  <Image style={styles.episodeScreenshot}
                         source={this.props.screenshot} />
                </View>
                <View style={styles.episodeNameNumber}>
                  <Text style={styles.episodeName} numberOfLines={1}>{this.props.name}</Text>
                  <View style={styles.episodeSubtitle}>
                    <Text style={styles.episodeNumber}>Episodio {this.props.number}</Text>
                    <Text style={styles.episodeDate}>{this.props.date}</Text>
                  </View>
                </View>
                <View style={styles.episodeOption}>
                </View>
              </View>

            </TouchableNativeFeedback>
            <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
              {this.props.children}
            </View>
          </Animated.View>
        )
    );
  }
}

let styles = StyleSheet.create({
  body: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  episode: {
    flex: 1,
    //borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow:'hidden',
  },
  episodeExpanded: {
    flex: 1,
    //borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow:'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  episodeInner: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  episodeScreenshotView: {
    width: 80,
    height: 45.04,
  },
  episodeScreenshot: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    borderRadius: 3,
  },
  episodeNameNumber: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 2,
  },
  episodeName: {
    color: '#dadade',
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  episodeSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  episodeNumber: {
    color: 'rgba(255, 255, 255, 0.66)',
  },
  episodeDate: {
    color: 'rgba(255, 255, 255, 0.66)',
    fontSize: 13,
  },
  episodeOption: {

  },
});

export default EpisodeCollapse;
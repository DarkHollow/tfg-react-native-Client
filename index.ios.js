import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Navigator,
  StatusBar,
} from 'react-native';

import Root from './root';
import Register from './register';
import Search from './search';
import TvShow from './tvshow';
import RequestTvShow from "./requestTvShow";

export default class TrendingSeriesClient extends Component {

  static renderScene(route, navigator) {
    console.log(route);

    if (route.name === 'root') {
      return <Root navigator={navigator} />
    }
    if (route.name === 'register') {
      return <Register navigator={navigator} />
    }
    if (route.name === 'search') {
      return <Search navigator={navigator} />
    }
    if (route.name === 'tvshow') {
      return <TvShow navigator={navigator} {...route.passProps} />
    }
    if (route.name === 'requestTvShow') {
      return <RequestTvShow navigator={navigator} {...route.passProps} />
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar animated />
        <Navigator
          style={{backgroundColor: '#3e50b4'}}
          initialRoute={{ name: 'root'}}
          renderScene={TrendingSeriesClient.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.name === 'search') {
              return Navigator.SceneConfigs.PushFromRight;
            } else if (route.name === 'tvshow') {
              return Navigator.SceneConfigs.FloatFromBottom;
            } else if (route.name === 'requestTvShow') {
              return Navigator.SceneConfigs.FloatFromBottom;
            } else {
              return Navigator.SceneConfigs.PushFromRight;
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
  }
});

AppRegistry.registerComponent('TrendingSeriesClient', () => TrendingSeriesClient);

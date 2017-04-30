import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Navigator,
  BackAndroid,
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

    // comportamiento del botón Back de Android según la escena
    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (route.name === 'root') {
        return true;
      } else if (route.name === 'register' || route.name === 'search' || route.name === 'tvshow' || route.name === 'requestTvShow') {
        navigator.pop();
        return true;
      }
    });

    // qué vista cargar en el navigator
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
        <StatusBar animated backgroundColor={'#2f3e9e'} />
        <Navigator
          style={{backgroundColor: '#3e50b4'}}
          initialRoute={{ name: 'root'}}
          renderScene={TrendingSeriesClient.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.name === 'search') {
              return Navigator.SceneConfigs.FadeAndroid;
            } else if(route.name === 'tvshow') {
              return Navigator.SceneConfigs.FloatFromBottomAndroid;
            } else {
              return Navigator.SceneConfigs.FloatFromBottomAndroid;
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

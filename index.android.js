import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  StatusBar,
  BackHandler,
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';

import Root from './root';
import Login from './login';
import Register from './register';
import Search from './search';
import TvShow from './tvshow';
import RequestTvShow from "./requestTvShow";

export default class TrendingSeriesClient extends Component {

  renderScene(route, navigator) {
    console.log(route);

    // comportamiento del botón Back de Android según la escena
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'root') {
        return true;
      } else if (route.name === 'login' || route.name === 'register' || route.name === 'search' || route.name === 'tvshow' || route.name === 'requestTvShow') {
        navigator.pop();
        return true;
      }
    });

    // qué vista cargar en el navigator
    if (route.name === 'root') {
      return <Root navigator={navigator} />
    }
    if (route.name === 'login') {
      return <Login navigator={navigator} />
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
        <CustomComponents.Navigator
          style={{backgroundColor: 'rgba(80,80,80,1)'}}
          initialRoute={{ name: 'root'}}
          renderScene={this.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.name === 'register') {
              return CustomComponents.Navigator.SceneConfigs.FloatFromRightAndroid;
            } else if (route.name === 'search') {
              return CustomComponents.Navigator.SceneConfigs.FadeAndroid;
            } else if(route.name === 'tvshow') {
              return CustomComponents.Navigator.SceneConfigs.FloatFromBottomAndroid;
            } else {
              return CustomComponents.Navigator.SceneConfigs.FloatFromBottomAndroid;
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

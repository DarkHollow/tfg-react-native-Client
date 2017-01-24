import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  BackAndroid,
  StatusBar,
} from 'react-native';

import Root from './root';
import Search from './search.android';
import Series from './series';

export default class TrendingSeriesClient extends Component {

  renderScene(route, navigator) {
    console.log(route);

    // comportamiento del botón Back de Android según la escena
    BackAndroid.addEventListener('hardwareBackPress', () => {
      if (route.name == 'root') {
        return true;
      } else if(route.name == 'search') {
        navigator.pop();
        return true;
      }
    });

    // qué vista cargar en el navigator
    if (route.name == 'root') {
      return <Root navigator={navigator} />
    }
    if (route.name == 'search') {
      return <Search navigator={navigator} />
    }
    if (route.name == 'series') {
      return <Series navigator={navigator} {...route.passProps} />
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar animated backgroundColor={'#2f3e9e'} />
        <Navigator
          style={{backgroundColor: '#3e50b4'}}
          initialRoute={{ name: 'root'}}
          renderScene={this.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.name == 'search') {
              return Navigator.SceneConfigs.FadeAndroid;
            } else if(route.name == 'series') {
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
    backgroundColor: '#fafafa',
  }
});

AppRegistry.registerComponent('TrendingSeriesClient', () => TrendingSeriesClient);

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  StatusBar,
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';

import Root from './root';
import Search from './search';
import TvShow from './tvshow';
import RequestTvShow from "./requestTvShow";

export default class TrendingSeriesClient extends Component {

  renderScene(route, navigator) {
    console.log(route);

    if (route.name === 'root') {
      return <Root navigator={navigator} />
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
        <CustomComponents.Navigator
          style={{backgroundColor: '#3e50b4'}}
          initialRoute={{ name: 'root'}}
          renderScene={this.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.name === 'search') {
              return CustomComponents.Navigator.SceneConfigs.PushFromRight;
            } else if (route.name === 'tvshow') {
              return CustomComponents.Navigator.SceneConfigs.FloatFromBottom;
            } else if (route.name === 'requestTvShow') {
              return CustomComponents.Navigator.SceneConfigs.FloatFromBottom;
            } else {
              return CustomComponents.Navigator.SceneConfigs.PushFromRight;
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

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  StatusBar,
} from 'react-native';

import Root from './root';
import Search from './search.ios';
import Series from './series';
import SearchResults from './searchResults';

export default class TrendingSeriesClient extends Component {

  renderScene(route, navigator) {
    console.log(route);

    if (route.name == 'root') {
      return <Root navigator={navigator} />
    }
    if (route.name == 'search') {
      return <Search navigator={navigator} />
    }
    if (route.name == 'series') {
      return <Series navigator={navigator} {...route.passProps} />
    }
    if (route.name == 'searchResults') {
      return <SearchResults navigator={navigator} {...route.passProps} />
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar animated />
        <Navigator
          style={{backgroundColor: '#3e50b4'}}
          initialRoute={{ name: 'root'}}
          renderScene={this.renderScene.bind(this)}
          configureScene={(route) => {
            if (route.name == 'search') {
              return Navigator.SceneConfigs.PushFromRight;
            } else if (route.name == 'series') {
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
    backgroundColor: '#fafafa',
  }
});

AppRegistry.registerComponent('TrendingSeriesClient', () => TrendingSeriesClient);

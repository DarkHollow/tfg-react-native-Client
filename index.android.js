import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator
} from 'react-native';

import Root from './root';
import Search from './search';
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
    if (route.name == 'searchResults') {
      return <SearchResults navigator={navigator} {...route.passProps} />
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Navigator
          initialRoute={{ name: 'root'}}
          renderScene={this.renderScene.bind(this)}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  }
});

AppRegistry.registerComponent('TrendingSeriesClient', () => TrendingSeriesClient);

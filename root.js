import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Navigator,
  TouchableHighlight,
  StatusBar,
} from 'react-native';

class Root extends Component {
  navigate(routeName) {
    this.props.navigator.push({
      name: routeName
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar animated />
        <Text style={styles.title}>Trending Series</Text>

        <TouchableHighlight onPress={this.navigate.bind(this, 'search')}
          style={styles.button} >
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableHighlight>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 10,
    paddingTop: 180
  },
  title: {
    fontSize: 25,
    marginBottom: 15
  },
  button: {
    height: 40,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    color: '#FFF',
    alignSelf: 'center'
  }
});

export default Root;

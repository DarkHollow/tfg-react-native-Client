import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  StatusBar,
} from 'react-native';

class Root extends Component {

  navigateTo(route, reset) {
    this.props.navigator.push({
      name: route, reset: reset
    });
  }

  async logout() {
    console.log("logout");
    try {
      await AsyncStorage.multiRemove(['jwt', 'userId', 'userName']).then(() => {
        console.log('Storage sesión eliminada');
      }).done();
      // token borrado, navegamos a login
      this.navigateTo('login', true);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar animated />
        <Text style={styles.title}>Trending Series</Text>

        <TouchableHighlight onPress={ () => this.logout().done()}
                            style={styles.button} >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableHighlight>

        <TouchableHighlight onPress={this.navigateTo.bind(this, 'search', false)}
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
    backgroundColor: '#eeeeee',
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

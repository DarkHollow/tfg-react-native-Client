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
  navigate(routeName) {
    this.props.navigator.push({
      name: routeName
    });
  }

  async logout() {
    console.log("logout");
    try {
      await AsyncStorage.removeItem('jwt').then(() => {
        console.log('Storage \'jwt\' eliminado');
      }).done();
      // token borrado, navegamos a login, TODO: resetear navigator stack
      this.navigate('login');
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

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Navigator,
} from 'react-native';

class Register extends Component {
  constructor() {
    super();
  }

  render() {
    return(
      <View style={styles.statusBarAndNavView}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} hidden animated />
        <Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
          navigationBar={
            null
          }
        />
      </View>
    );
  }

  renderScene(route, navigator) {
    return (
      <View style={styles.container}>
        <View style={styles.viewBody}>
          <View style={styles.principalView}>
            <Text style={styles.principalTitleText}>Trending Series</Text>
            <Text style={styles.principalText}>Regístrate para poder acceder a la aplicación.</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statusBarAndNavView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  viewBody: {
    flex: 1,
    backgroundColor: '#eeeeee',
    paddingLeft: 20,
    paddingRight: 20,
  },
  principalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  principalTitleText: {
    marginBottom: 20,
    fontSize: 20,
  },
  principalText: {
    marginBottom: 20,
    color: '#616161',
  },
});

export default Register;

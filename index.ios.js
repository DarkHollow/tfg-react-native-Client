import React, { Component } from 'react';
import {
  AppRegistry,
  AsyncStorage,
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';
import LinearGradient from 'react-native-linear-gradient';

import Root from './root';
import Login from './login';
import Register from './register';
import Search from './search';
import TvShow from './tvshow';
import Season from './season';
import RequestTvShow from "./requestTvShow";
import PopularTvShows from "./popularTvShows";
import MostRatedTvShows from "./mostRatedTvShows";
import MyShows from "./myShows";

export default class TrendingSeriesClient extends Component {

  constructor() {
    super();
    this.state = {
      initialRoute: '',
      loading: true,
      userId: 0,
      userName: '',
    };
  }

  processCheckJWTResponse(data) {
    return !!data.ok;
  }

  setInitialRoute(route) {
    this.setState({"initialRoute": route});
    this.setState({"loading": false});
  }

  checkJWT() {
    // comprobamos sesion (token jwt)
    console.log("comprobando jwt almacenado");
    return AsyncStorage.getItem("jwt")
      .then((jwt) => {
        console.log("token almacenado: " + jwt);
        if (jwt !== null) {
          // verificar token
          console.log("Verificando token");
          const URL = (Platform.OS === 'ios') ?
            'http://localhost:9000/api/users/session' : 'http://192.168.1.13:9000/api/users/session';

          fetch(URL, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + jwt,
            },
          }).then((response) => response.json())
          .finally((responseData) => {
            if (this.processCheckJWTResponse(responseData)) {
              // token correcto
              // cargamos datos usuario y vamos a la app
              AsyncStorage.multiGet(['userId', 'userName']).then((userData) => {
                this.setState({userId: userData[0][1], userName: userData[1][1]});
                this.setInitialRoute('root');
              });
            } else {
              // token incorrecto, vamos a login
              this.setState({userId: 0, userName: ''});
              this.setInitialRoute('login');
            }
          }).catch((error) => {
            // error fetching
            console.error(error);
            this.setInitialRoute('login');
          });
        } else {
          // no hay token almacenado
          console.log("No hay token almacenado");
          this.setInitialRoute('login');
        }
      });
  }

  componentWillMount() {
    this.checkJWT();
  }

  renderScene(route, navigator) {
    console.log(route);

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
    if (route.name === 'season') {
      return <Season navigator={navigator} {...route.passProps} />
    }
    if (route.name === 'requestTvShow') {
      return <RequestTvShow navigator={navigator} {...route.passProps} />
    }
    if (route.name === 'popularTvShows') {
      return <PopularTvShows navigator={navigator} />
    }
    if (route.name === 'mostRatedTvShows') {
      return <MostRatedTvShows navigator={navigator} />
    }
    if (route.name === 'myShows') {
      return <MyShows navigator={navigator}/>
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <LinearGradient style={[styles.container, {alignItems: 'center', justifyContent: 'center'}]}
                        start={{x: 1, y: 0}} end={{x: 0.2, y: 1}}
                        colors={['#1d1d1d', '#303030']}>
          <StatusBar animated hidden />
          <ActivityIndicator style={styles.loader}
                             size={'large'} color={'rgba(255,149,0,1)'} />
        </LinearGradient>
      );
    } else {
      return (
        <View style={styles.container}>
          <StatusBar animated hidden />
          <CustomComponents.Navigator
            ref={component => this._navigator = component}
            style={{backgroundColor: '#1e1e1e'}}
            sceneStyle={{backgroundColor: 'transparent'}}
            initialRoute={{ name: this.state.initialRoute }}
            renderScene={this.renderScene.bind(this)}
            configureScene={(route) => {
              if (route.name === 'login' || route.name === 'root' || route.name === 'popularTvShows' || route.name === 'mostRatedTvShows' || route.name === 'myShows') {
                return CustomComponents.Navigator.SceneConfigs.FadeAndroid;
              } else if (route.name === 'search') {
                return CustomComponents.Navigator.SceneConfigs.Fade10;
              } else if (route.name === 'tvshow') {
                return CustomComponents.Navigator.SceneConfigs.FloatFromBottom;
              } else if (route.name === 'requestTvShow') {
                return CustomComponents.Navigator.SceneConfigs.FloatFromBottom;
              } else {
                return CustomComponents.Navigator.SceneConfigs.PushFromRight;
              }
            }}
            onDidFocus={ (route) => {
              if (route.reset) {
                this._navigator.immediatelyResetRouteStack([ {name: route.name} ]);
              }
            }}
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

AppRegistry.registerComponent('TrendingSeriesClient', () => TrendingSeriesClient);

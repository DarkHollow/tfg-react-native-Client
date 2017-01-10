import React, { Component } from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  View,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class Series extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seriesId: this.props.seriesId,
      fetchEnded: false,
      seriesData: {},
    }
  }

  errorAndPop() {
    Alert.alert('Error', 'Lamentablemente no se han podido cargar los datos de la serie');
    this.props.navigator.pop();
  }

  componentWillMount() {
    console.log('Consulta serie id: ' + this.state.seriesId);
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/series/' : 'http://192.168.1.13:9000/api/series/';

    // hacemos fetch a la API
    fetch(URL + this.state.seriesId, {method: "GET"})
    .then((response) => response.json())
    .then((responseData) => {
      // procesamos datos
      this.processData(responseData);
    }).then( () => {
      // indicamos que fetch ha terminado
      this.setState({fetchEnded: true});
    }).catch((error) => {
      this.errorAndPop();
    });
  }

  processData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error != undefined) {
      if (data.error == 'Not Found') {
        // id no encontrada
      } else {
        // otro tipo de error interno
      }
      // mostramos error y volvemos atrás
      this.errorAndPop();
    } else {
      // cargamos datos en el state
      this.setState({seriesData: data});
    }
  }

  render() {
    return (
      <View style={styles.statusBarAndNavView}>
        <StatusBar
          animated
          translucent
          barStyle="light-content"
          backgroundColor={'transparent'}
        />
        <Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
          navigationBar={
            <Navigator.NavigationBar
              routeMapper={NavigationBarRouteMapper(this.props)}
              style={styles.nav} />
          }
        />
      </View>
    );
  }

  renderScene(route, navigator) {
    return (
      <View style={styles.containerDark}>
        <Text style={{color: 'white', padding: 100}}>{this.state.seriesData.seriesName}</Text>
      </View>
    );
  }

}

var NavigationBarRouteMapper = props => ({
  LeftButton(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={styles.backButton}
          onPress={() => navigator.parentNavigator.pop()}>
        <Icon name="ios-arrow-back" style={styles.backIcon} />
        <Text style={styles.backButtonText}>

        </Text>
      </TouchableOpacity>
    );
  },
  RightButton(route, navigator, index, navState) {
    return null;
  },
  Title(route, navigator, index, navState) {
    return (
      <View style={styles.titleView}>
        <Text style={styles.titleText}>

        </Text>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  statusBarAndNavView: {
    flex: 1,
  },
  containerDark: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#212121',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8.5,
    paddingTop: 5.5
  },
  backButtonText: {
    fontSize: 17,
    color: '#c0c5ff',
    marginTop: 6,
    marginLeft: 6,
  },
  backIcon: {
    fontSize: 33,
    color: '#dddddd',
    shadowColor: '#000000',
    shadowOffset: {
    },
    shadowOpacity: 0.8,
  },
});

export default Series;

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Navigator,
  TouchableHighlight,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class Search extends Component {
  constructor() {
    super();
    this.state = {
      searchText: "",
      showProgress: false,
      jsonData: "",
    }
  }

  redirect(routeName) {
    this.props.navigator.push({
      name: routeName
    });
  }

  onBuscarBtnPressed() {
    // fetch datos de la API
    this.setState({showProgress: true});

    console.log('Buscar ' + this.state.searchText);

    fetch('http://localhost:9000/api/search/series/' + this.state.searchText, {method: "GET"})
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({showProgress: false});
      this.redirect('searchResults', responseData);
    }).catch((error) => {
      this.setState({showProgress: false});
      Alert.alert('', 'Lamentablemente, no se ha podido buscar');
    });
  }

  redirect(routeName, responseData) {
    this.props.navigator.push({
      name: routeName,
      passProps: {
        responseData: responseData,
        searchText: this.state.searchText
      }
    });
  }

  render() {
    return(
      <Navigator
        renderScene={this.renderScene.bind(this)}
        navigator={this.props.navigator}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper}
            style={styles.nav} />
        }
      />
    );
  }

  renderScene(route, navigator) {
    var spinner = this.state.showProgress ?
      ( <ActivityIndicator style={styles.loader}
          size='large'/> ) :
      ( <View/>);

    return (
      <View style={styles.container}>
        <View style={styles.viewSearch}>
          <TextInput
           onChangeText={ (text)=> this.setState({searchText: text}) }
           style={styles.input} value={this.state.searchText}
           placeholder='¿Qué serie buscas?'
          underlineColorAndroid='rgba(0,0,0,0)'
          autoCorrect={false} >
          </TextInput>
        </View>

        <View style={styles.viewBody}>
          <TouchableHighlight onPress={this.onBuscarBtnPressed.bind(this)} style={styles.button}>
            <Text style={styles.buttonText}>
              Buscar
            </Text>
          </TouchableHighlight>
          {spinner}
        </View>

      </View>
    );
  }
}

var NavigationBarRouteMapper = {
  LeftButton(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={styles.backButton}
          onPress={() => navigator.parentNavigator.pop()}>
        <Icon name="md-arrow-back" style={styles.backIcon} />
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
          Buscar
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    //justifyContent: 'flex-start',
    //alignItems: 'center',
    backgroundColor: '#fafafa',
    //padding: 10,
    paddingTop: 56
  },
  nav: {
    elevation: 6,
    backgroundColor: '#3e50b4',
  },
  titleView: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: '#fefefe',
    fontSize: 20,
    fontFamily: 'Roboto-Medium'
  },
  backButton: {
    flex: 1,
    justifyContent: 'center',
    padding: 14
  },
  backIcon: {
    fontSize: 24,
    color: '#fefefe'
  },
  viewSearch: {
    elevation: 2,
    height: 53,
    borderWidth: 1,
    borderColor: '#fefefe',
    backgroundColor: '#fefefe'
  },
  input: {
    height: 50,
    alignSelf: 'stretch',
    marginTop: 6,
    backgroundColor: '#fefefe',
    color: '#212121',
    fontSize: 16,
    paddingLeft: 40,
    paddingTop: 2
  },
  viewBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  button: {
    height: 40,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    color: '#FFF',
    alignSelf: 'center'
  },
  heading: {
    fontSize: 30,
  },
  loader: {
    marginTop: 20
  }
});

export default Search;

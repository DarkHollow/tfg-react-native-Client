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
  Alert
} from 'react-native';

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
            routeMapper={NavigationBarRouteMapper} />
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

        <TextInput
         onChangeText={ (text)=> this.setState({searchText: text}) }
         style={styles.input} value={this.state.searchText} >
        </TextInput>

        <TouchableHighlight onPress={this.onBuscarBtnPressed.bind(this)} style={styles.button}>
          <Text style={styles.buttonText}>
            Buscar
          </Text>
        </TouchableHighlight>
        {spinner}
      </View>
    );
  }
}

var NavigationBarRouteMapper = {
  LeftButton(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
          onPress={() => navigator.parentNavigator.pop()}>
        <Text style={styles.backButtonText}>
          &lt; Volver
        </Text>
      </TouchableOpacity>
    );
  },
  RightButton(route, navigator, index, navState) {
    return null;
  },
  Title(route, navigator, index, navState) {
    return (
      <Text style={styles.titleText}>
        Buscar
      </Text>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 10,
    paddingTop: 80
  },
  titleText: {
    color: 'black',
    margin: 10,
    fontSize: 16
  },
  backButtonText: {
    marginLeft: 10
  },
  input: {
    height: 50,
    alignSelf: 'stretch',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48bbec',
    color: 'black'
  },
  button: {
    height: 50,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 22,
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

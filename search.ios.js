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
import Icon from 'react-native-vector-icons/Ionicons';
import { Hideo } from 'react-native-textinput-effects';

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
          <Hideo
            placeholder='¿Qué serie buscas?'
            iconClass={Icon}
            iconName={'ios-search'}
            iconColor={'#757575'}
            iconBackgroundColor={'#fefefe'}
            inputStyle={styles.input}
            onChangeText={ (text)=> this.setState({searchText: text}) }
            onSubmitEditing={ () => this.onBuscarBtnPressed() }
          />
        </View>

        <View style={styles.viewBody}>
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
        <Icon name="ios-arrow-back" style={styles.backIcon} />
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
    justifyContent: 'flex-start',
    //alignItems: 'center',
    backgroundColor: '#fafafa',
    //padding: 10,
    paddingTop: 64
  },
  nav: {
    backgroundColor: '#3e50b4',
  },
  titleView: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: '#fefefe',
    fontSize: 17,
    fontWeight: '500'
  },
  backButton: {
    flex: 1,
    justifyContent: 'center',
    padding: 9,
    paddingTop: 11
  },
  backIcon: {
    fontSize: 33,
    color: '#fefefe'
  },
  viewSearch: {
    height: 46,
    alignSelf: 'stretch',
    backgroundColor: '#fefefe',
    shadowColor: '#000000',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowOpacity: 0.2,
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#fefefe',
    color: '#757575',
    fontSize: 16
  },
  viewBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  loader: {
    marginTop: 20
  }
});

export default Search;

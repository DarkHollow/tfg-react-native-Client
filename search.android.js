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
  ListView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Hideo } from 'react-native-textinput-effects';

class Search extends Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      searchText: "",
      searchedText: "",
      showProgress: false,
      dataSource: ds.cloneWithRows([])
    }
  }

  onBuscarBtnPressed() {
    // fetch datos de la API

    // mostramos spinner
    this.setState({showProgress: true});
    // guardamos el termino buscado
    this.setState({searchedText: this.state.searchText});
    // vaciamos la lista
    this.setState({dataSource: this.state.dataSource.cloneWithRows([])});

    console.log('Buscar ' + this.state.searchText);

    // hacemos fetch a la API
    fetch('http://192.168.1.13:9000/api/search/series/' + this.state.searchText, {method: "GET"})
    .then((response) => response.json())
    .then((responseData) => {
      this.processData(responseData);
      this.setState({showProgress: false});
    }).catch((error) => {
      this.setState({showProgress: false});
      Alert.alert('', 'Lamentablemente, no se ha podido buscar');
    });
  }

  processData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error == "Not found") {
      // TODO: mostrar que no se ha encontrado
    } else {
      this.setState({dataSource: this.state.dataSource.cloneWithRows(data)});
    }
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
            iconName={'md-search'}
            iconColor={'#757575'}
            iconBackgroundColor={'#fefefe'}
            inputStyle={styles.input}
            onChangeText={ (text)=> this.setState({searchText: text}) }
            onSubmitEditing={ () => this.onBuscarBtnPressed() }
          />
        </View>

        <View style={styles.viewBody}>
          {spinner}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) => <Text>{rowData.seriesName}</Text>}
            enableEmptySections={true}
          />
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
    paddingTop: 80
  },
  nav: {
    elevation: 6,
    backgroundColor: '#3e50b4',
    marginTop: 24
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
    height: 54,
    borderWidth: 1,
    borderColor: '#fefefe',
    backgroundColor: '#fefefe',
    paddingTop: 4
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

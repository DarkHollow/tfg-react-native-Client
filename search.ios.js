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
  ListView,
  Image
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
    fetch('http://localhost:9000/api/search/series/' + this.state.searchText, {method: "GET"})
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

  renderRow(rowData) {
    return (
      <TouchableOpacity style={styles.rowTouch}>
        <View style={styles.row}>
          <View style={styles.rowTop}>
            <Image style={styles.rowImage}
              source={{uri: rowData.banner}}
            />
          </View>
          <View style={styles.rowBottom}>
            <View style={styles.rowBottomLeft}>
              <Text style={styles.rowTitle}>{rowData.seriesName}</Text>
              <Text style={styles.rowSubtitle}>Año
                {' ' + new Date(rowData.firstAired).getFullYear()}
              </Text>
            </View>
            <View style={styles.rowBottomRight}>
              <View style={styles.rating}>
                <Text style={styles.ratingText}>4,7</Text>
                <Icon name='ios-star' style={styles.ratingIcon}></Icon>
                <Icon name='ios-arrow-forward' style={styles.forwardIcon}></Icon>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
            iconColor={'#616161'}
            iconBackgroundColor={'#ffffff'}
            inputStyle={styles.input}
            clearButtonMode={'always'}
            onChangeText={ (text)=> this.setState({searchText: text}) }
            onSubmitEditing={ () => this.onBuscarBtnPressed() }
          />
        </View>

        <View style={styles.viewBody}>
          {spinner}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={(rowData) => this.renderRow(rowData)}
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
    backgroundColor: '#fafafa',
    paddingTop: 64
  },
  nav: {
    backgroundColor: '#3e50b4',
    borderBottomWidth: 1,
    borderColor: '#2f3e9e'
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
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowOpacity: 0.2,
    zIndex: 1,
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    color: '#616161',
    fontSize: 16
  },
  viewBody: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#eeeeee'
  },
  rowTouch: {
    flex: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#dedede'
  },
  row: {
    flex: 1,
    backgroundColor: '#fafafa'
  },
  rowTop: {
    flex: 1,
  },
  rowImage: {
    height: 66,
    resizeMode: 'cover'
  },
  rowBottom: {
    flex: 1,
    flexDirection: 'row',
    padding: 14
  },
  rowBottomLeft: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    color: '#212121'
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#aaaaaa'
  },
  rowBottomRight: {
    alignSelf: 'flex-end',
    marginBottom: 3
  },
  rating: {
    flexDirection: 'row'
  },
  ratingText: {
    fontSize: 12,
    color: '#aaaaaa',
    marginRight: 3,
    marginTop: 3
  },
  ratingIcon: {
    fontSize: 14,
    color: '#aaaaaa',
    marginTop: 3
  },
  forwardIcon: {
    fontSize: 20,
    color: '#bbbbc1',
    marginLeft: 20
  },
  loader: {
    marginTop: 20
  }
});

export default Search;

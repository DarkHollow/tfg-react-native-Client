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
  Image,
  Animated
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
      dataSource: ds.cloneWithRows([]),
      listviewOpacity: new Animated.Value(0),
    }
  }

  listviewAnimationShow() {
    Animated.timing(this.state.listviewOpacity, {
      toValue: 1,
      duration: 500
    }).start();
  }

  listviewAnimationHide() {
    Animated.timing(this.state.listviewOpacity, {
      toValue: 0,
      // fade out, es decir, opacity de 1 to 0 en iOS SÍ funciona
      duration: 500
    }).start();
  }

  onBuscarBtnPressed() {
    // fetch datos de la API
    // ocultamos lista y mostramos spinner
    this.listviewAnimationHide();
    this.setState({showProgress: true});
    // guardamos el termino buscado
    this.setState({searchedText: this.state.searchText});

    console.log('Buscar ' + this.state.searchText);

    // hacemos fetch a la API
    fetch('http://localhost:9000/api/search/series/' + this.state.searchText, {method: "GET"})
    .then((response) => response.json())
    .then((responseData) => {
      this.processData(responseData);
    }).then( () => {
      // ocultamos spinner
      this.setState({showProgress: false});
    }).then( () => {
      // mostramos lista
      this.listviewAnimationShow();
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
          size={'small'} color={'#fe3f80'} /> ) :
      ( <View/>);

    return (
      <View style={styles.container}>
        <View style={styles.viewSearch}>
          <Hideo
            placeholder={'¿Qué serie buscas?'}

            iconClass={Icon}
            iconName={'ios-search'}
            iconColor={'#616161'}
            iconBackgroundColor={'#eeeeee'}
            inputStyle={styles.input}
            clearButtonMode={'always'}
            onChangeText={ (text)=> this.setState({searchText: text}) }
            onSubmitEditing={ () => this.onBuscarBtnPressed() }
          />
          {spinner}
        </View>

        <View style={styles.viewBody}>
          <Animated.View style={{opacity: this.state.listviewOpacity}}>
            <ListView
              dataSource={this.state.dataSource}
              renderRow={(rowData) => this.renderRow(rowData)}
              enableEmptySections={true}
            />
          </Animated.View>
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
    height: 49,
    alignSelf: 'stretch',
    backgroundColor: '#eeeeee',
    zIndex: 1,
  },
  input: {
    height: 30,
    marginTop: 10,
    alignSelf: 'stretch',
    backgroundColor: '#e6e6e6',
    color: '#616161',
    fontSize: 14,
    marginRight: 50,
    borderRadius: 4
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
    marginTop: 20,
    alignSelf: 'flex-end',
    marginRight: 14,
    marginBottom: 20
  }
});

export default Search;

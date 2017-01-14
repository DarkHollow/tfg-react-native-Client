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
  Animated,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Hideo } from 'react-native-textinput-effects';

class Search extends Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      searchText: '',
      searchedText: '',
      showProgress: false,
      showListView: false,
      showNotFound: false,
      dataSource: ds.cloneWithRows([]),
      listviewOpacity: new Animated.Value(0),
      notFoundOpacity: new Animated.Value(0),
    }
  }

  /* mensaje popUp */
  popUp(title, message) {
    Alert.alert(title, message);
  }

  /* mensaje popUp */
  onSubmit() {
    console.log('Buscar ' + this.state.searchText);

    this.setState({showProgress: true});
    this.notFoundAnimationHide(0);
    this.listviewAnimationHide(0);

    // comprobar longitud de query
    if (this.state.searchText.length >= 3) {
      // guardamos el termino buscado
      this.setState({searchedText: this.state.searchText});

      // hacemos fetch a la API
      fetch('http://localhost:9000/api/search/series/' + this.state.searchText, {method: "GET"})
      .then((response) => response.json())
      .then((responseData) => {
        this.processData(responseData);
      }).then( () => {
        // ocultamos spinner
        this.setState({showProgress: false});
      }).then( () => {
        // ocultamos teclado
        Keyboard.dismiss();
      }).catch((error) => {
        this.setState({showProgress: false});
        this.popUp('Error', 'Lamentablemente no se ha podido realizar la búsqueda');
      });
    } else {
      this.setState({showProgress: false});
      this.popUp('Buscar', 'Introduce como mínimo 3 caracteres');
    }
  }

  processData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error) {
      if (data.error == 'Not found') {
        // no se han encontrado resultados con esa query
        this.notFoundAnimationShow(0);
      } else {
        // otro tipo de error interno
        this.popUp('Error', 'Lamentablemente no se ha podido realizar la búsqueda');
      }
    } else {
      // cargamos datos en el datasource
      this.setState({dataSource: this.state.dataSource.cloneWithRows(data)});
      this.listviewAnimationShow(0);
    }
  }

  /* redirige a la vista de ficha de serie */
  openSeries(seriesId) {
    console.log('Ver serie con id:' + seriesId);
    this.props.navigator.push({
      name: 'series',
      passProps: {
        seriesId: seriesId,
        backButtonText: 'Búsqueda'
      }
    });
  }

  /* animaciones */

  notFoundAnimationShow(delay) {
    setTimeout( () => {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows([]),
        showNotFound: true,
      });
      Animated.timing(this.state.notFoundOpacity, {
        toValue: 1,
        delay: delay,
        duration: 250
      }).start();
    }, 110);
  }

  notFoundAnimationHide(delay) {
    Animated.timing(this.state.notFoundOpacity, {
      toValue: 0,
      delay: delay,
      duration: 100
    }).start( () => {
      this.setState({showNotFound: false});
    });
  }

  listviewAnimationShow(delay) {
    setTimeout( ()=> {
      this.setState({showListView: true});
      Animated.timing(this.state.listviewOpacity, {
        toValue: 1,
        delay: delay,
        duration: 250
      }).start();
    }, 110);
  }

  listviewAnimationHide(delay) {
    Animated.timing(this.state.listviewOpacity, {
      toValue: 0,
      delay: delay,
      duration: 100
    }).start( () => {
      this.setState({showListView: false});
    });
  }

  /* cabecera del listview: mostrar cuántos resultados se han obtenido */
  renderHeader() {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderLeft}>Resultados de "{this.state.searchedText}"</Text>
        <Text style={styles.listHeaderRight}>{this.state.dataSource.getSectionLengths()}</Text>
      </View>
    );
  }

  /* contenido de cada elemento del listview */
  renderRow(rowData) {
    return (
      <TouchableOpacity style={styles.rowTouch} onPress={ () => this.openSeries(rowData.id)}>
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
      <View style={styles.statusBarAndNavView}>
        <StatusBar barStyle={'light-content'} animated />
        <Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
          navigationBar={
            <Navigator.NavigationBar
              routeMapper={NavigationBarRouteMapper}
              style={styles.nav} />
          }
        />
      </View>
    );
  }

  renderScene(route, navigator) {
    var spinner = this.state.showProgress ? (
      <ActivityIndicator style={styles.loader}
        size={'small'} color={'#fe3f80'} />
    ) : ( null );

    var notFound = this.state.showNotFound ? (
      <Animated.View style={[styles.notFound, {opacity: this.state.notFoundOpacity}]}>
        <View style={styles.notFoundCircle}>
          <Icon name={(Platform.OS === 'ios') ? 'ios-search' : 'md-search'} style={styles.notFoundIcon}></Icon>
        </View>
        <Text style={styles.notFoundText}>Sin resultados</Text>
      </Animated.View>
    ) : ( null );

    return (
      <View style={styles.container}>
        <View style={styles.viewSearch}>
          <Hideo
            ref={'textinput'}
            autoFocus={true}
            placeholder={'¿Qué serie buscas?'}
            iconClass={Icon}
            iconName={'ios-search'}
            iconColor={'#616161'}
            iconBackgroundColor={'#eeeeee'}
            inputStyle={styles.input}
            clearButtonMode={'always'}
            onChangeText={ (text)=> this.setState({searchText: text}) }
            onSubmitEditing={ () => this.onSubmit() }
          />
          {spinner}
        </View>

        <KeyboardAvoidingView behavior={'padding'} style={styles.viewBody}>
          {(this.state.showListView) ? (
            <Animated.View style={{opacity: this.state.listviewOpacity}}>
              <ListView
                dataSource={this.state.dataSource}
                renderHeader={() => this.renderHeader()}
                renderRow={(rowData) => this.renderRow(rowData)}
                enableEmptySections={true}
              />
            </Animated.View>
          ) : (
            null
          )}
          {notFound}
        </KeyboardAvoidingView>
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
  statusBarAndNavView: {
    flex: 1,
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
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#fafafa',
    paddingTop: 64
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
  listHeader: {
    backgroundColor: '#e6e6e6',
    padding: 8,
    paddingLeft: 12,
    flexDirection: 'row'
  },
  listHeaderLeft: {
    flex: 1,
    fontSize: 12,
    fontWeight: '100',
    color: '#616161'
  },
  listHeaderRight: {
    alignSelf: 'flex-end',
    marginRight: 5,
    fontSize: 12,
    fontWeight: '100',
    color: '#616161'
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
    width: null,
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
  },
  notFound: {
    flex: 1,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundCircle: {
    height: 120,
    width: 120,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 200,
  },
  notFoundIcon: {
    fontSize: 50,
    color: '#dddddd'
  },
  notFoundText: {
    marginTop: 10,
    fontSize: 20,
    color: '#bbbbc1',
  },
});

export default Search;

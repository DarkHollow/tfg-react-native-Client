import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
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
  AsyncStorage,
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import { Hideo } from 'react-native-textinput-effects';

/* Constantes de URLs */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';

class Search extends Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      userId: 0,
      userName: '',
      jwt: '',
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

  // obtener datos usuario
  async getUserData() {
    await AsyncStorage.multiGet(['userId', 'userName', 'jwt']).then((userData) => {
      this.setState({
        userId: userData[0][1],
        userName: userData[1][1],
        jwt: userData[2][1]
      });
    });
  }

  componentWillMount() {
    this.getUserData();
  }

  /* mensaje popUp */
  popUp(title, message) {
    Alert.alert(title, message);
  }

  /* submit buscar */
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
      fetch('http://localhost:9000/api/tvshows?search=' + this.state.searchText, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.jwt,
        }
      }).then((response) => response.json())
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
        console.log(error);
        this.popUp('Error', 'Lamentablemente no se ha podido realizar la búsqueda');
      });
    } else {
      this.setState({showProgress: false});
      this.popUp('Buscar', 'Introduce como mínimo 3 caracteres');
    }
  }

  /* procesamos los datos que nos devuelve la API */
  processData(data) {
    // si la API nos devuelve que no ha encontrado nada
    if (data.error) {
      if (data.error === 'Not found') {
        // no se han encontrado resultados con esa query
        this.notFoundAnimationShow(0);
      } else if (data.error === 'Bad request') {
        // error bad request por introducir menos de 3 caracteres
        this.popUp('Buscar', 'Introduce como mínimo 3 caracteres');
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

  // process image uri
  formatImageUri(uri) {
    result = uri;

    if (uri !== null && uri !== undefined) {
      if (uri.length > 2) {
        result = URLSERVER + uri.substring(2);
      }
    }
    return result;
  }

  /* redirige a la vista de ficha del tv show */
  openTvShow(tvShowId) {
    console.log('Ver tv show con id:' + tvShowId);
    this.props.navigator.push({
      name: 'tvshow',
      passProps: {
        tvShowId: tvShowId,
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
    }, 200);
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
    }, 200);
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

  /* navegar a vista de solicitar nueva serie */
  navigateToRequestTvShow() {
    console.log('Navegar a solicitar nueva serie');
    this.props.navigator.push({
      name: 'requestTvShow',
      passProps: {
        searchText: this.state.searchText
      }
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
      <TouchableOpacity style={styles.rowTouch} onPress={ () => this.openTvShow(rowData.id)}>
        <View style={styles.row}>
          <View style={styles.rowTop}>
            <Image style={styles.rowImage}
              source={ rowData.banner !== null ? {uri: this.formatImageUri(rowData.banner)} : require('./img/placeholderBanner.png')}
            />
          </View>
          <View style={styles.rowBottom}>
            <View style={styles.rowBottomLeft}>
              <Text style={styles.rowTitle}>{rowData.name}</Text>
              <Text style={styles.rowSubtitle}>Año
                {' ' + new Date(rowData.firstAired).getFullYear()}
              </Text>
            </View>
            <View style={styles.rowBottomRight}>
              <View style={styles.rating}>
                <Text style={styles.ratingText}>{(rowData.voteCount === 0) ? 'Sin votos' : rowData.score}</Text>
                <Icon name='ios-star' style={styles.ratingIcon} />
                <Icon name='ios-arrow-forward' style={styles.forwardIcon} />
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
        <CustomComponents.Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
          navigationBar={
            <CustomComponents.Navigator.NavigationBar
              routeMapper={NavigationBarRouteMapper}
              style={styles.nav} />
          }
        />
      </View>
    );
  }

  renderScene(route, navigator) {
    let spinner = this.state.showProgress ? (
      <ActivityIndicator style={styles.loader}
        size={'small'} color={'#fe3f80'} />
    ) : ( null );

    let notFound = this.state.showNotFound ? (
      <Animated.View style={[styles.notFound, {opacity: this.state.notFoundOpacity}]}>
        <View style={styles.notFoundCircle}>
          <Icon name={(Platform.OS === 'ios') ? 'ios-search' : 'md-search'} style={styles.notFoundIcon} />
        </View>
        <Text style={styles.notFoundText}>Sin resultados</Text>
        <View style={styles.solicitarSerie}>
          <Text style={styles.solicitarSerieQuestion}>¿No encuentras lo que buscas?</Text>
          <Icon.Button name='ios-add' size={26} style={styles.addButton} onPress={ () => { this.navigateToRequestTvShow() }}
                       underlayColor={'white'}>
            <Text style={styles.principalButtonText}>Solicitar nueva serie</Text>
          </Icon.Button>
        </View>
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
              <View style={styles.solicitarSerie}>
                <Text style={styles.solicitarSerieQuestion}>¿No encuentras lo que buscas?</Text>
                <Icon.Button name='ios-add' size={26} style={styles.addButton} onPress={() => { this.navigateToRequestTvShow() }}
                             underlayColor={'white'}>
                  <Text style={styles.principalButtonText}>Solicitar nueva serie</Text>
                </Icon.Button>
              </View>
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

let NavigationBarRouteMapper = {
  LeftButton(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={styles.backButton}
          onPress={() => navigator.parentNavigator.pop()}>
        <Icon name="ios-arrow-back" style={styles.backIcon} />
      </TouchableOpacity>
    );
  },
  RightButton(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={styles.addButtonNavigator}
          onPress={() => navigator.parentNavigator.push({
            name: 'requestTvShow'
          }) }>
        <Icon name="md-add" style={styles.addButtonIconNavigator} />
      </TouchableOpacity>
    );
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
  addButtonNavigator: {
    flex: 1,
    justifyContent: 'center',
    padding: 9,
  },
  addButtonIconNavigator: {
    fontSize: 35,
    color: '#ff3d83'
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
  solicitarSerie: {
    margin: 10,
    alignItems: 'center',
    padding: 8,
  },
  solicitarSerieQuestion: {
    marginBottom: 8,
    color: '#bbbbc1',
  },
  addButton: {
    backgroundColor: '#ff3d83',
    paddingTop: 2,
    paddingBottom: 2,
  },
  addIcon: {
    color: '#ffffff',
  },
  principalButtonText: {
    color: '#ffffff'
  },
});

export default Search;

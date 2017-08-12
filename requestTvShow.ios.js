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

class RequestTvShow extends Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      userId: 0,
      userName: '',
      jwt: '',
      searchText: this.props.searchText,
      searchedText: '',
      showProgress: false,
      showListView: false,
      showNotFound: false,
      data: '',
      dataSource: ds.cloneWithRows([]),
      listviewOpacity: new Animated.Value(0),
      notFoundOpacity: new Animated.Value(0),
    }
  }

  // obtener datos usuario
  async getUserId() {
    await AsyncStorage.multiGet(['userId', 'userName', 'jwt']).then((userData) => {
      this.setState({
        userId: userData[0][1],
        userName: userData[1][1],
        jwt: userData[2][1]
      });
    });
  }

  componentWillMount() {
    this.getUserId();
  }

  /* mensaje popUp */
  popUp(title, message) {
    Alert.alert(title, message);
  }

  /* submit buscar */
  onSubmit() {
    console.log('Buscar en TVDB ' + this.state.searchText);

    this.setState({showProgress: true});
    this.notFoundAnimationHide(0);
    this.listviewAnimationHide(0);

    // comprobar longitud de query
    if (this.state.searchText !== undefined) {
      let searchText = this.state.searchText;
      if (searchText.length >= 3) {
        // guardamos el termino buscado
        this.setState({searchedText: searchText});

        // encodeamos URI
        uri = encodeURI(searchText);

        // hacemos fetch a la API
        fetch('http://localhost:9000/api/search/TVDB/' + uri, {
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
          console.log(error.stack);
          this.setState({showProgress: false});
          this.popUp('Error', 'Lamentablemente no se ha podido realizar la búsqueda');
        });
      } else {
        this.setState({showProgress: false});
        this.popUp('Buscar', 'Introduce como mínimo 3 caracteres');
      }
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
      // nos guardamos los datos en json por si hiciera falta modificar algo en tiempo real
      this.setState({data: data});
      this.listviewAnimationShow(0);
    }
  }

  processRequestResponse(tvdbId, data) {
    if (data.error) {
      if (data.error === 'This user requested this TV Show already') {
        this.popUp('Error', 'Esta serie ya ha sido solicitada');
      } else if (data.error === 'This user doesn\'t exist') {
        this.popUp('Error', 'Fallo en la solicitud');
      } else if (data.error === 'TV Show is on local already') {
        this.popUp('Error', 'Esta serie ya está en nuestra aplicación');
      } else if (data.error === 'TV Show doesn\'t exist on TVDB') {
        this.popUp('Error', 'Fallo al obtener datos de la serie, prueba de nuevo en un momento');
      } else if (data.error === 'tvdbId/userId can\'t be null') {
        this.popUp('Error', 'Fallo al procesar solicitud, prueba de nuevo en un momento');
      }
    } else if (data.ok) {
      // actualizamos los datos
      let data = this.state.data;
      let index = data.findIndex(function (item) {
        return item.tvdbId === tvdbId;
      });

      //noinspection JSUnresolvedVariable
      let newArray = this.state.dataSource._dataBlob.s1.slice();
      newArray[index] = {
        tvdbId: data[index].tvdbId,
        name: data[index].name,
        firstAired: data[index].firstAired,
        banner: data[index].banner,
        local: data[index].local,
        requestStatus: 'Requested',
      };

      this.setState({dataSource: this.state.dataSource.cloneWithRows(newArray)});
      this.popUp('Serie solicitada', 'La serie ha sido solicitada y será revisada por un administrador');
    }
  }

  /* abre o solicita la serie (segun si la tenemos en local o no) */
  openOrRequest(rowData) {
    console.log('Ver o solicitar tv show con id de TVDB: ' + rowData.tvdbId);

    // si la tenemos en local, abrir
    if (rowData.local) {
      this.props.navigator.push({
        name: 'tvshow',
        passProps: {
          tvShowId: rowData.id,
          backButtonText: 'Solicitar'
        }
      });
    } else if (rowData.requestStatus) {
      // si está solicitada, mostrar mensaje
      let requestMessage;
      if (rowData.requestStatus === "Requested") {
        requestMessage = "Esta serie ya ha sido solicitada";
      } else if (rowData.requestStatus === "Processing") {
        requestMessage = "Esta serie ha sido aceptada y está siendo procesada";
      } else if (rowData.requestStatus === "Rejected") {
        requestMessage = "Esta serie ha sido rechazada";
      }
      Alert.alert('Solicitar nueva serie', requestMessage);
    } else {
      // si no esta, seguro que quiere solicitarla ?
      Alert.alert(
        'Solicitar nueva serie',
        '¿Seguro que deseas solicitar la serie \'' + rowData.name + '\'?',
        [
          {text: 'Sí', onPress: () => {
            // solicitar serie
            return AsyncStorage.getItem("jwt")
              .then((jwt) => {
                fetch('http://localhost:9000/api/tvshows/requests', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.state.jwt,
                  },
                  body: JSON.stringify({
                    tvdbId: rowData.tvdbId,
                    userId: this.state.userId,
                  })
                }).then((response) => response.json())
                  .finally((responseData) => {
                    this.processRequestResponse(rowData.tvdbId, responseData);
                  });
              });
          }},
          {text: 'Cancelar', onPress: () => console.log('Cancelar')},
        ]
      )
    }
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
    let requestSpinner = <ActivityIndicator style={styles.requestLoader} size={'small'} color={'#fe3f80'} />;

    return (
      <TouchableOpacity style={styles.rowTouch} onPress={ () => this.openOrRequest(rowData)}>
        <View style={styles.row}>
          <View style={styles.rowTop}>
            <Image style={styles.rowImage}
                   source={{uri: 'https://thetvdb.com/banners/' + rowData.banner}}
                   defaultSource={require('./img/placeholderBanner.png')}
            />
          </View>
          <View style={styles.rowBottom}>
            <View style={styles.rowBottomLeft}>
              <Text style={styles.rowTitle}>{rowData.name}</Text>
              <Text style={styles.rowSubtitle}>Año
                {' ' + new Date(rowData.firstAired).getFullYear()}
              </Text>
            </View>

            { rowData.local ? (
                <View style={styles.rowBottomRight}>
                  <View style={styles.rating}>
                    <View style={styles.localView}>
                      <Text style={styles.localText}>En local</Text>
                    </View>
                    <Text style={styles.ratingText}>4,7</Text>
                    <Icon name='ios-star' style={styles.ratingIcon} />
                    <Icon name='ios-arrow-forward' style={styles.forwardIcon} />
                  </View>
                </View>
            ) : (
              rowData.requestStatus ? (
                <View style={styles.rowBottomRightRequested}>
                      {rowData.requestStatus === "Requested" ? (
                        <View style={styles.requested}>
                          <Icon name='ios-time-outline' style={styles.requestedIcon} />
                          <Text style={styles.requestedText}>Solicitada</Text>
                        </View>
                      ) : (
                        rowData.requestStatus === "Processing" ? (
                          <View style={styles.requested}>
                            {requestSpinner}
                            <Text style={styles.requestedText}>Procesando</Text>
                          </View>
                        ) : (
                          rowData.requestStatus === "Rejected" ? (
                            <View style={styles.requested}>
                              <Icon name='ios-alert-outline' style={styles.requestedIcon} />
                              <Text style={styles.requestedText}>Rechazada</Text>
                            </View>
                          ) : (
                            null
                          )
                        )
                      )}
                </View>
              ) : (
                <View style={styles.rowBottomRightRequest}>
                  <View style={styles.request}>
                    <Icon name='ios-add' style={styles.requestIcon} />
                    <Text style={styles.requestText}>Solicitar</Text>
                  </View>
                </View>
              )
            )}

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
      </Animated.View>
    ) : ( null );

    return (
      <View style={styles.container}>
        <View style={styles.viewSearch}>
          <Hideo
            autoFocus={true}
            placeholder={'Buscar serie externamente'}
            iconClass={Icon}
            iconName={'ios-search'}
            iconColor={'#616161'}
            iconBackgroundColor={'#eeeeee'}
            inputStyle={styles.input}
            clearButtonMode={'always'}
            returnKeyType={'search'}
            defaultValue={this.props.searchText}
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
    return (<View/>);
  },
  Title(route, navigator, index, navState) {
    return (
      <View style={styles.titleView}>
        <Text style={styles.titleText}>
          Solicitar nueva serie
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
  viewSearchTitle: {
    padding: 10,
    paddingBottom: 0,
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
    marginBottom: 3,
    borderRadius: 3,
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
  localView: {
    flexDirection: 'row',
    marginRight: 12,
    padding: 3,
    paddingLeft: 6,
    paddingRight: 6,
    backgroundColor: '#eeeeee',
    borderRadius: 3,
  },
  localText: {
    fontSize: 12,
    color: '#aaaaaa'
  },
  rowBottomRightRequest: {
    alignSelf: 'flex-end',
    marginBottom: 3,
    paddingLeft: 7,
    paddingTop: 3,
    paddingRight: 6,
    paddingBottom: 2,
    backgroundColor: '#ff3d83',
    borderRadius: 5,
  },
  request: {
    flexDirection: 'row',
  },
  forwardIcon: {
    fontSize: 20,
    color: '#bbbbc1',
    marginLeft: 20
  },
  requestText: {
    fontSize: 12,
    color: '#ffffff',
    marginRight: 3,
    marginTop: 3
  },
  requestIcon: {
    fontSize: 20,
    color: '#ffffff',
    marginRight: 3
  },
  rowBottomRightRequested: {
    alignSelf: 'flex-end',
    marginBottom: 3,
    paddingLeft: 7,
    paddingTop: 3,
    paddingRight: 6,
    paddingBottom: 2,
    backgroundColor: '#eeeeee',
    borderRadius: 5,
  },
  requested: {
    flexDirection: 'row',
  },
  requestedText: {
    fontSize: 12,
    color: '#aaaaaa',
    marginRight: 3,
    marginTop: 3,
    paddingBottom: 3
  },
  requestedIcon: {
    fontSize: 20,
    color: '#aaaaaa',
    marginRight: 3
  },
  loader: {
    marginTop: 20,
    alignSelf: 'flex-end',
    marginRight: 14,
    marginBottom: 20
  },
  requestLoader: {
    marginRight: 4,
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

export default RequestTvShow;

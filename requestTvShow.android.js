import React, {Component} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ListView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  AsyncStorage,
} from "react-native";
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from "react-native-vector-icons/Ionicons";
import {Hideo} from "react-native-textinput-effects";

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

  /* mensaje popUp */
  popUp(title, message) {
    Alert.alert(title, message);
  }

  componentWillMount() {
    this.getUserId();
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
        fetch('http://192.168.1.13:9000/api/search/TVDB/' + uri, {
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
        this.popUp('Error', 'Ya has solicitado esta serie');
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
      let index = data.findIndex(function(item) {
        return item.tvdbId === tvdbId;
      });

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
    console.log('Ver o solicitar tv show con id de TVDB:' + rowData.tvdbId);

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
                fetch('http://192.168.1.13:9000/api/tvshows/requests', {
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
    let requestSpinner = <ActivityIndicator style={styles.loader} size={'small'} color={'#fe3f80'} />

    return (
      <View style={styles.rowContainer}>
        <TouchableNativeFeedback style={styles.rowTouch}
                                 onPress={ () => this.openOrRequest(rowData)}
                                 background={TouchableNativeFeedback.Ripple(rowData.local ? ('rgba(100,100,100,0.15)') : ('#ff77a7'), true)}
                                 useForeground>
          <View style={styles.row}>
            <View style={styles.rowTop}>
              <Image style={styles.rowImage}
                source={ (rowData.banner !== '') ? {uri: 'https://thetvdb.com/banners/' + rowData.banner} : require('./img/placeholderBanner.png') }
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
                    <Icon name='md-star' style={styles.ratingIcon} />
                  </View>
                </View>
            ) : (
              rowData.requestStatus ? (
                <View style={styles.rowBottomRightRequested}>
                  {rowData.requestStatus === "Requested" ? (
                    <View style={styles.requested}>
                      <Icon name='md-time' style={styles.requestedIcon} />
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
                          <Icon name='md-alert' style={styles.requestedIcon} />
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
                    <Icon name='md-add' style={styles.requestIcon} />
                    <Text style={styles.requestText}>Solicitar</Text>
                  </View>
                </View>
              )
            )}

            </View>
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }

  /* pie de la listview para hacer padding en Android por navbar transparente */
  renderFooter() {
    return (
      <View style={styles.separatorView} />
    );
  }

  render() {
    return(
      <View style={styles.statusBarAndNavView}>
        <StatusBar animated backgroundColor={'#2f3e9e'} />
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
          <Text style={styles.solicitarSerieQuestion}>Al parecer no podemos encontrar ni dentro ni fuera la serie que buscas =(</Text>
        </View>
      </Animated.View>
    ) : ( null );

    return (
      <View style={styles.container}>
        <View style={styles.viewSearch}>
          <Hideo
            autoFocus={true}
            placeholder='Buscar serie externamente'
            iconClass={Icon}
            iconName={'md-search'}
            iconColor={'#616161'}
            iconBackgroundColor={'#ffffff'}
            inputStyle={styles.input}
            clearButtonMode={'always'}
            returnKeyType={'search'}
            defaultValue={this.props.searchText}
            onChangeText={ (text)=> this.setState({searchText: text}) }
            onSubmitEditing={ () => this.onSubmit() }
          />
        </View>

        {spinner}

        <KeyboardAvoidingView behavior={'padding'} style={styles.viewBody}>
          {(this.state.showListView) ? (
            <Animated.View style={{opacity: this.state.listviewOpacity}}>
              <ListView
                dataSource={this.state.dataSource}
                renderHeader={() => this.renderHeader()}
                renderRow={(rowData) => this.renderRow(rowData)}
                renderFooter={() => this.renderFooter()}
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
      <View style={styles.backButtonView}>
        <TouchableOpacity style={styles.backButton}
            onPress={() => navigator.parentNavigator.pop()}>
          <Icon name="md-arrow-back" style={styles.backIcon} />
        </TouchableOpacity>
      </View>
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
    elevation: 6,
    backgroundColor: '#3e50b4',
    height: 80,
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
  backButtonView: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    flex: 1,
    justifyContent: 'center',
    padding: 14,
  },
  backIcon: {
    fontSize: 24,
    color: '#fefefe'
  },
  rightButtonView: {
    width: 45,
    height: 45,
    marginTop: 6,
    borderRadius: 45,
  },
  addButtonNavigator: {
    flex: 1,
    justifyContent: 'center',
    padding: 14,
    paddingTop: 13,
    borderRadius: 14,
  },
  addButtonIconNavigator: {
    fontSize: 24,
    color: '#ff3d83'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#eeeeee',
    paddingTop: 80
  },
  viewSearch: {
    elevation: 2,
    height: 54,
    borderWidth: 1,
    borderColor: '#fefefe',
    backgroundColor: '#ffffff',
    paddingTop: 4
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    color: '#616161',
    fontSize: 16
  },
  viewBody: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  listHeader: {
    backgroundColor: '#e6e6e6',
    padding: 14,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row'
  },
  listHeaderLeft: {
    flex: 1,
    fontFamily: 'Roboto-Light'
  },
  listHeaderRight: {
    alignSelf: 'flex-end',
    fontFamily: 'Roboto-Light'
  },
  rowContainer: {
    flex: 1,
    elevation: 2,
    backgroundColor: '#fafafa',
    margin: 12,
    marginTop: 8,
    marginBottom: -2,
    borderRadius: 2
  },
  rowTouch: {
  },
  row: {
    flex: 1,
    borderRadius: 2
  },
  rowTop: {
    flex: 1,
    borderRadius: 2
  },
  rowImage: {
    height: 66,
    width: null,
    resizeMode: 'cover',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
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
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: '#212121'
  },
  rowSubtitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#616161'
  },
  rowBottomRight: {
    alignSelf: 'flex-end',
    marginBottom: 8
  },
  rating: {
    flexDirection: 'row'
  },
  ratingText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#616161',
    marginTop: 4,
    marginRight: 3
  },
  ratingIcon: {
    marginTop: 5,
    fontSize: 14,
    color: '#616161'
  },
  localView: {
    flexDirection: 'row',
    marginRight: 12,
    marginTop: 1,
    padding: 3,
    paddingLeft: 6,
    paddingRight: 6,
    backgroundColor: '#eeeeee',
    borderRadius: 3,
  },
  localText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#aaaaaa'
  },
  rowBottomRightRequest: {
    elevation: 1,
    alignSelf: 'flex-end',
    marginBottom: 6,
    padding: 3,
    paddingLeft: 6,
    paddingRight: 6,
    backgroundColor: '#ff3d83',
    borderRadius: 3,
  },
  request: {
    flexDirection: 'row',
  },
  requestText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#ffffff',
    marginRight: 3,
  },
  requestIcon: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 3
  },
  rowBottomRightRequested: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    padding: 3,
    paddingLeft: 6,
    paddingRight: 6,
    backgroundColor: '#eeeeee',
    borderRadius: 3,
  },
  requested: {
    flexDirection: 'row',
  },
  requestedText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#aaaaaa',
    marginRight: 3,
  },
  requestedIcon: {
    fontSize: 16,
    color: '#aaaaaa',
    marginRight: 3
  },
  separatorView: {
    height: 54
  },
  loader: {
    marginTop: 20
  },
  requestLoader: {
    marginRight: 4,
  },
  notFound: {
    flex: 1,
    marginTop: -60,
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
    paddingBottom: 8,
    alignItems: 'center',
  },
  solicitarSerieQuestion: {
    marginBottom: 8,
    fontFamily: 'Roboto-Regular',
    color: '#bbbbc1',
  },
  solicitarSerieButtonView: {
    borderRadius: 5,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#ff3d83',
    padding: 6,
    borderRadius: 5,
  },
  addIcon: {
    color: '#ffffff',
  },
  principalButtonText: {
    color: '#ffffff',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
  },
});

export default RequestTvShow;

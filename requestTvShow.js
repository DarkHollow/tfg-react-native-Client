import React, {Component} from "react";
import {
  ActivityIndicator,
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
  Modal,
  TextInput,
  Button,
} from "react-native";
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from "react-native-vector-icons/Ionicons";

/* Constantes de URLs */
const URLSERVER = (Platform.OS === 'ios') ?
  'http://localhost:9000/' : 'http://192.168.1.13:9000/';
const URLTVDB = 'https://thetvdb.com/';
const TVDBBANNERS = 'banners/';

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
      modalVisible: false,
      modalButtons: null,
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

  // mostrar u ocultar modal: mostrar/ocultar, titulo, mensaje, mostrar/ocultar spinner
  setModalVisible(visible, title, message, loading, buttons) {
    this.setState({modalTitle: title});
    this.setState({modalMessage: message});
    this.setState({modalLoading: loading});
    this.setState({modalButtons: buttons});
    this.setState({modalVisible: visible});
  }

  showModal(title, message, loading) {
    this.setModalVisible(true, title, message, loading, null);
  }

  hideModal() {
    this.setModalVisible(false, '', '', false, null);
  }

  showAndHideModal(title, message, loading) {
    this.showModal(title, message, loading);
    setTimeout(() => this.hideModal(), 2000);
  }

  showButtonsModal(title, message, buttons) {
    this.setModalVisible(true, title, message, null, buttons)
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
        fetch('http://192.168.1.13:9000/api/tvshows?search=' + uri + '&tvdb=1', {
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
          this.showAndHideModal('Error', 'Lamentablemente no se ha podido realizar la búsqueda', false);
        });
      } else {
        this.setState({showProgress: false});
        this.showAndHideModal('Buscar', 'Introduce como mínimo 3 caracteres', false);
      }
    } else {
      this.setState({showProgress: false});
      this.showAndHideModal('Buscar', 'Introduce como mínimo 3 caracteres', false);
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
        this.showAndHideModal('Buscar', 'Introduce como mínimo 3 caracteres', false);
      } else {
        // otro tipo de error interno
        this.showAndHideModal('Error', 'Lamentablemente no se ha podido realizar la búsqueda', false);
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
        this.showAndHideModal('Error', 'Esta serie ya ha sido solicitada', false);
      } else if (data.error === 'This user doesn\'t exist') {
        this.showAndHideModal('Error', 'El proceso de solicitud ha fallado', false);
      } else if (data.error === 'TV Show is on local already') {
        this.showAndHideModal('Error', 'Esta serie ya está en la aplicación', false);
      } else if (data.error === 'TV Show doesn\'t exist on TVDB') {
        this.showAndHideModal('Error', 'Fallo al obtener los datos, prueba dentro de un rato', false);
      } else if (data.error === 'tvdbId/userId can\'t be null') {
        this.showAndHideModal('Error', 'Fallo al procesar la solicitud, prueba dentro de un rato', false);
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
      this.showAndHideModal('Serie solicitada', 'La serie ha sido solicitada y será revisada por un administrador', false);
    } else {
      this.showAndHideModal('Solicitar serie nueva', 'Lamentablemente ha ocurrido un error solicitando la serie', false);
    }
  }

  // process image uri
  formatImageUriTVDB(uri) {
    result = uri;

    if (uri !== null && uri !== undefined) {
      if (uri.length > 2) {
        result = URLTVDB + TVDBBANNERS + uri.substring(0);
      }
    }
    console.log(result);
    return result;
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
    } else {
      // estados de serie que no pueden ser pedidas
      if (rowData.requestStatus && (rowData.requestStatus === "Requested" || rowData.requestStatus === "Processing")) {
        let requestMessage;
        if (rowData.requestStatus === 'Requested') {
          requestMessage = 'Esta serie ya ha sido solicitada, pronto un administrador la revisará';
        } else if (rowData.requestStatus === 'Processing') {
          requestMessage = 'Esta serie ha sido aceptada y está siendo procesada';
        }
        this.showAndHideModal('Solicitar nueva serie', requestMessage, false);
        return false;
      }

      // estados de serie que pueden ser pedidas
      let requestTitle = 'Solicitar serie nueva';
      /* nos interesa que el usuario sepa que anteriormente ha sido rechazada o eliminada ? De momento desactivado
         también ha sido desactivado de los estilos, no se ve el tag de rechazada, eliminada...
      if (rowData.requestStatus && (rowData.requestStatus === 'Rejected' || rowData.requestStatus === 'Deleted')) {
        if (rowData.requestStatus === 'Rejected') {
          requestTitle = 'Solicitar serie rechazada';
        } else if (rowData.requestStatus === 'Deleted') {
          requestTitle = 'Solicitar reaprobación de serie eliminada';
        }
      }*/

      // seguro que quiere solicitarla ?
      modalButtons = [];
      modalButtons.push(this.getModalRequestButton(1, 'Sí', rowData.tvdbId, rowData.name));
      modalButtons.push(this.getModalCancelButton(2, 'No'));

      this.showButtonsModal(requestTitle, '¿Quieres solicitar la serie \'' + rowData.name + '\'?', modalButtons);
    }
  }

  getModalRequestButton(key, title, tvdbId, name) {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.modalBottomButtonView} key={key}>
          <Button
            onPress={ () => this.requestTvShow(tvdbId, name) }
            title={title.toUpperCase()}
            color={'rgba(255,149,0,1)'}
          />
        </View>
      )
    } else {
      return (
        <View style={styles.modalBottomButtonView} key={key}>
          <TouchableNativeFeedback
            onPress={ () => this.requestTvShow(tvdbId, name) }
            background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
            <View style={styles.modalBottomButton}>
              <Text style={styles.modalBottomButtonText}>{title.toUpperCase()}</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      )
    }
  }

  getModalCancelButton(key, title) {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.modalBottomButtonView} key={key}>
          <Button
            onPress={ () => this.hideModal() }
            title={title.toUpperCase()}
            color={'rgba(255,149,0,1)'}
            bold
          />
        </View>
      );
    }  else {
      return (
        <View style={styles.modalBottomButtonView} key={key}>
          <TouchableNativeFeedback
            onPress={ () => this.hideModal() }
            background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
            <View style={styles.modalBottomButton}>
              <Text style={styles.modalBottomButtonText}>{title.toUpperCase()}</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }
  }

  requestTvShow(tvdbId, name) {
    // poner modal a loading
    this.showModal('Solicitar serie nueva', 'Solicitando \'' + name + '\'', true);

    // solicitar serie
    return AsyncStorage.getItem("jwt")
      .then((jwt) => {
        fetch('http://192.168.1.13:9000/api/requests', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
          },
          body: JSON.stringify({
            tvdbId: tvdbId,
          })
        }).then((response) => response.json())
          .finally((responseData) => {
            this.processRequestResponse(tvdbId, responseData);
          });
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

  onBackPress(navigator) {
    navigator.parentNavigator.pop();
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
    let requestSpinner = <ActivityIndicator style={styles.requestLoader} size={'small'} color={'rgba(255,149,0,1)'} />;

    return (
      (Platform.OS === 'ios') ? (
        <TouchableOpacity style={styles.rowTouch} onPress={ this.openOrRequest.bind(this, rowData) }>
          <View style={styles.row}>
            <View style={styles.rowTop}>
              <Image style={styles.rowImage}
                     source={ (rowData.banner !== undefined && rowData.banner !== null && rowData.banner !== '') ? {uri: this.formatImageUriTVDB(rowData.banner)} : require('./img/placeholderBanner.png')}
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
                  </View>
                </View>
              ) : (
                rowData.requestStatus ? (
                  rowData.requestStatus === "Requested" ? (
                    <View style={styles.rowBottomRightRequested}>
                      <View style={styles.requested}>
                        <Icon name='ios-time-outline' style={styles.requestedIcon} />
                        <Text style={styles.requestedText}>Solicitada</Text>
                      </View>
                    </View>
                  ) : (
                    rowData.requestStatus === "Deleted" ? (
                      /*<View style={styles.requested}>
                        <Icon name='io-trash' style={styles.requestedIcon} />
                        <Text style={styles.requestedText}>Eliminada</Text>
                      </View>*/
                      <View style={styles.solicitarSerieButtonView}>
                        <Button
                          onPress={ this.openOrRequest.bind(this, rowData) }
                          title={'Solicitar'.toUpperCase()}
                          color={'rgba(255,149,0,1)'}
                        />
                      </View>
                    ) : (
                      rowData.requestStatus === "Processing" ? (
                        <View style={styles.rowBottomRightRequested}>
                          <View style={styles.processing}>
                            {requestSpinner}
                            <Text style={styles.processingText}>Procesando</Text>
                          </View>
                        </View>
                      ) : (
                        rowData.requestStatus === "Rejected" ? (
                          /*<View style={styles.requested}>
                            <Icon name='ios-alert' style={styles.requestedIcon} />
                            <Text style={styles.requestedText}>Rechazada</Text>
                          </View>*/
                          <View style={styles.solicitarSerieButtonView}>
                            <Button
                              onPress={ this.openOrRequest.bind(this, rowData) }
                              title={'Solicitar'.toUpperCase()}
                              color={'rgba(255,149,0,1)'}
                            />
                          </View>
                        ) : (
                          null
                        )
                      )
                    )
                  )
                ) : (
                  <View style={styles.solicitarSerieButtonView}>
                    <Button
                      onPress={ this.openOrRequest.bind(this, rowData) }
                      title={'Solicitar'.toUpperCase()}
                      color={'rgba(255,149,0,1)'}
                    />
                  </View>
                )
              )}
            </View>
          </View>
        </TouchableOpacity>
      ) : (
          <View style={styles.rowTouch} onPress={ this.openOrRequest.bind(this, rowData) }>
            <TouchableNativeFeedback
              onPress={ this.openOrRequest.bind(this, rowData) }
              background={TouchableNativeFeedback.Ripple('rgba(255,149,0,1)', true)}
              useForeground>
              <View style={styles.row}>
                <View style={styles.rowTop}>
                  <Image style={styles.rowImage}
                         source={ (rowData.banner !== undefined && rowData.banner !== null && rowData.banner !== '') ? {uri: this.formatImageUriTVDB(rowData.banner)} : require('./img/placeholderBanner.png')}
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
                      rowData.requestStatus === "Requested" ? (
                        <View style={styles.rowBottomRightRequested}>
                          <View style={styles.requested}>
                            <Icon name='md-time' style={styles.requestedIcon} />
                            <Text style={styles.processingText}>Solicitada</Text>
                          </View>
                        </View>
                      ) : (
                        rowData.requestStatus === "Deleted" ? (
                          /*<View style={styles.rowBottomRightRequested}>
                            <View style={styles.requested}>
                              <Icon name='md-trash' style={styles.requestedIcon} />
                              <Text style={styles.requestedText}>Eliminada</Text>
                            </View>
                          </View>*/
                          <TouchableNativeFeedback
                            onPress={ this.openOrRequest.bind(this, rowData) }
                            background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                            <View style={styles.addButton}>
                              <Text style={styles.principalButtonText}>{'Solicitar'.toUpperCase()}</Text>
                            </View>
                          </TouchableNativeFeedback>
                        ) : (
                          rowData.requestStatus === "Processing" ? (
                            <View style={styles.rowBottomRightRequested}>
                              <View style={styles.requested}>
                                {requestSpinner}
                                <Text style={styles.requestedText}>Procesando</Text>
                              </View>
                            </View>
                          ) : (
                            rowData.requestStatus === "Rejected" ? (
                              /*<View style={styles.rowBottomRightRequested}>
                                <View style={styles.requested}>
                                  <Icon name='md-alert' style={styles.requestedIcon} />
                                  <Text style={styles.requestedText}>Rechazada</Text>
                                </View>
                              </View>*/
                              <TouchableNativeFeedback
                                onPress={ this.openOrRequest.bind(this, rowData) }
                                background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                                <View style={styles.addButton}>
                                  <Text style={styles.principalButtonText}>{'Solicitar'.toUpperCase()}</Text>
                                </View>
                              </TouchableNativeFeedback>
                            ) : (
                              null
                            )
                          )
                        )
                      )
                    ) : (
                      <TouchableNativeFeedback
                        onPress={ this.openOrRequest.bind(this, rowData) }
                        background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                        <View style={styles.addButton}>
                          <Text style={styles.principalButtonText}>{'Solicitar'.toUpperCase()}</Text>
                        </View>
                      </TouchableNativeFeedback>
                    )
                  )}
                </View>
              </View>
            </TouchableNativeFeedback>
          </View>
        )

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
        <StatusBar animated hidden />
        <CustomComponents.Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
        />
        <Modal
          animationType={'fade'}
          transparent
          onRequestClose={() => {}}
          visible={this.state.modalVisible}
        >
          <View style={styles.modal}>
            <View style={styles.innerModal}>
              <Text style={styles.modalTitle}>{this.state.modalTitle}</Text>
              <Text style={styles.modalMessage}>{this.state.modalMessage}</Text>
              {(this.state.modalLoading || this.state.modalButtons !== null) ? (
                <View style={styles.modalBottom}>
                  <View style={styles.modalBottomTopBorder} />
                  {(this.state.modalLoading) ? (
                    <ActivityIndicator style={styles.modalLoader}
                                       size={'small'} color={'rgba(255,149,0,1)'} />
                  ) : (
                    <View style={{flexDirection: 'row'}}>
                      { this.state.modalButtons }
                    </View>
                  )}

                </View>
              ) : ( null )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  renderScene(route, navigator) {
    let spinner = this.state.showProgress ? (
      <ActivityIndicator style={styles.loader}
        size={'small'} color={'rgba(255,149,0,1)'} />
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

    // definición de los botones de los Modal


    return (
      <View style={styles.container}>

        <View style={styles.doubleNavBar}>
          <View style={styles.navBarView}>
            <Icon style={styles.backIcon} onPress={ this.onBackPress.bind(this, navigator) }
                  name={(Platform.OS === 'ios') ? 'ios-arrow-back-outline' : 'md-arrow-back'} />
            <Text style={styles.navBarTitle}>Solicitar serie nueva</Text>
          </View>

          <View style={styles.searchView}>
            <Icon style={styles.searchIcon} name={(Platform.OS === 'ios') ? 'ios-search-outline' : 'md-search'} />
            <TextInput
              autoFocus={true}
              placeholder='Buscar serie externamente'
              placeholderTextColor={'rgba(255,255,255,0.4)'}
              style={styles.inputSearch}
              selectionColor={(Platform.OS === 'ios') ? 'rgba(255,149,0,1)' : 'rgba(255,149,0,0.5)'}
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              clearButtonMode={'always'}
              returnKeyType={'search'}
              defaultValue={this.props.searchText}
              onChangeText={ (text)=> this.setState({searchText: text}) }
              onSubmitEditing={ this.onSubmit.bind(this) }
            />
          </View>
        </View>

        {spinner}

        <KeyboardAvoidingView behavior={'padding'} style={styles.viewBody}>
          {(this.state.showListView) ? (
            <Animated.View style={[styles.listViewContainer, {opacity: this.state.listviewOpacity}]}>
              <ListView
                style={styles.listView}
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

const styles = StyleSheet.create({
  doubleNavBar: {
    backgroundColor: '#282828',
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
    }),
  },
  navBarView: {
    height: 56,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    backgroundColor: '#202020',
    elevation: 1,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.4,
        shadowRadius: 1,
      },
    }),
  },
  navBarTitle: {
    marginLeft: 34,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium'
      },
    }),
  },
  searchView: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  backIcon: {
    position: 'absolute',
    zIndex: 2,
    alignSelf: 'center',
    paddingTop: 1,
    paddingLeft: 14,
    paddingRight: 10,
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: {
        paddingTop: 3,
        fontSize: 33,
      },
    }),
  },
  searchIcon: {
    position: 'absolute',
    alignSelf: 'center',
    paddingLeft: 14,
    paddingRight: 10,
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    ...Platform.select({
      ios: {
        paddingTop: 1,
        fontSize: 24,
      },
    }),
  },
  inputSearch: {
    flex: 1,
    margin: 0,
    padding: 0,
    paddingLeft: 46,
    color: 'white',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
      },
      ios: {
        marginTop: 1,
      },
    }),
  },
  statusBarAndNavView: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
  },
  viewBody: {
    flex: 1,
    justifyContent: 'flex-start',
    zIndex: -1,
  },
  listViewContainer: {
    flex: 1,
  },
  listView: {
    flex: 1,
  },
  listHeader: {
    backgroundColor: '#282828',
    padding: 14,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row'
  },
  listHeaderLeft: {
    flex: 1,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
      },
      ios: {
        fontWeight: '100',
      },
    }),
    color: 'rgba(255, 255, 255, 0.76)',
  },
  listHeaderRight: {
    alignSelf: 'flex-end',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
      },
      ios: {
        fontWeight: '100',
      },
    }),
    color: 'rgba(255, 255, 255, 0.76)',
  },
  rowTouch: {
    flex: 1,
    elevation: 2,
    backgroundColor: '#333333',
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flex: 1,
    borderRadius: 2
  },
  rowTop: {
    flex: 1,
  },
  rowImage: {
    height: 66,
    width: null,
    resizeMode: 'cover',
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
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    fontSize: 16,
    color: '#rgba(255,255,255,0.96)',
  },
  rowSubtitle: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    fontSize: 12,
    color: '#rgba(255,255,255,0.56)',
  },
  rowBottomRight: {
    alignSelf: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#rgba(255,255,255,0.56)',
    marginRight: 3,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
  },
  ratingIcon: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.56)',
  },
  forwardIcon: {
    fontSize: 20,
    color: '#95959b',
    marginLeft: 20,
    marginTop: 3,
  },
  localView: {
    flexDirection: 'row',
    marginRight: 12,
    marginTop: 1,
    padding: 3,
    paddingLeft: 6,
    paddingRight: 6,
    backgroundColor: '#444',
    borderRadius: 3,
  },
  localText: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
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
    backgroundColor: 'rgba(255,149,0,1)',
    borderRadius: 3,
  },
  request: {
    flexDirection: 'row',
  },
  requestText: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
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
    paddingLeft: 8,
    paddingRight: 6,
    paddingBottom: 2,
    //backgroundColor: 'rgba(255,149,0,0.2)',
    backgroundColor: '#444',
    borderRadius: 3,
    ...Platform.select({
      android: {
        paddingBottom: 3,
      },
    }),
  },
  requested: {
    flexDirection: 'row',
  },
  requestedText: {
    paddingTop: 1,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
        paddingTop: 0,
      },
    }),
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginRight: 3,
  },
  requestedIcon: {
    ...Platform.select({
      android: {
        paddingTop: 2,
      },
    }),
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.45)',
    marginRight: 5,
  },
  processing: {
    flexDirection: 'row',
  },
  processingText: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
        paddingBottom: 3,
      },
    }),
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    paddingTop: 2,
    marginRight: 3,
  },
  separatorView: {
    flex: 1,
    marginTop: 20,
    ...Platform.select({
      android: {
        paddingBottom: 40,
      },
    }),
  },
  loader: {
    marginTop: 20
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundCircle: {
    height: 120,
    width: 120,
    backgroundColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 200,
  },
  notFoundIcon: {
    fontSize: 50,
    color: '#323232'
  },
  notFoundText: {
    marginTop: 10,
    fontSize: 20,
    color: '#989898',
  },
  requestLoader: {
    marginRight: 4,
  },
  solicitarSerie: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  solicitarSerieQuestion: {
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
    color: '#989898',
  },
  solicitarSerieButtonView: {
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  addIcon: {
    color: '#ffffff',
  },
  principalButtonText: {
    color: 'rgba(255,149,0,1)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    fontSize: 14,
  },
  modal: {
    flex: 1,
    padding: 50,
    backgroundColor: 'rgba(23,23,23,0.9)',
    justifyContent: 'center',
  },
  innerModal: {
    paddingTop: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#212121',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: { width: 0, height: 0},
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      }
    }),
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    marginBottom: 3,
  },
  modalMessage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    paddingHorizontal: 20,
    paddingBottom: 20,
    textAlign: 'center',
  },
  modalBottom: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    ...Platform.select({
      ios: {
        paddingLeft: 10,
        paddingRight: 10,
      },
    }),
  },
  modalBottomTopBorder: {
    borderTopWidth: 1,
    borderColor: 'rgba(245,245,245,0.05)',
    alignSelf: 'stretch'
  },
  modalLoader: {
    marginTop: 10,
    paddingBottom: 10,
  },
  modalBottomButtonView: {
    flex: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  modalBottomButton: {
    padding: 10,
    alignSelf: 'stretch',
  },
  modalBottomButtonText: {
    alignSelf: 'center',
    color: 'rgba(255,149,0,1)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
    fontSize: 14,
  },
});

export default RequestTvShow;

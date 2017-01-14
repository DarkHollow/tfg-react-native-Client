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
      // fade out, es decir, opacity de 1 to 0 no funciona, por lo que duration 0
      duration: 0
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
    fetch('http://192.168.1.13:9000/api/search/series/' + this.state.searchText, {method: "GET"})
    .then((response) => response.json())
    .then((responseData) => {
      this.processData(responseData);
    }).then( () => {
      // ocultamos spinner
      this.setState({showProgress: false});
    }).then( () => {
      // mostramos lista
      this.listviewAnimationShow();
      // ocultamos teclado
      Keyboard.dismiss();
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
      // cargamos datos en el datasource
      this.setState({dataSource: this.state.dataSource.cloneWithRows(data)});
    }
  }

  // redirige a la vista de ficha de serie
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

  renderHeader() {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderLeft}>Resultados de "{this.state.searchedText}"</Text>
        <Text style={styles.listHeaderRight}>{this.state.dataSource.getSectionLengths()}</Text>
      </View>
    );
  }

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
                <Icon name='md-star' style={styles.ratingIcon}></Icon>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /* pie de la listview para hacer padding en Android por navbar transparente */
  renderFooter() {
    return (
      <View style={styles.separatorView}></View>
    );
  }

  render() {
    return(
      <View style={styles.statusBarAndNavView}>
        <StatusBar animated backgroundColor={'#2f3e9e'} />
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
    var spinner = this.state.showProgress ?
      ( <ActivityIndicator style={styles.loader}
          size='large'/> ) :
      ( <View/>);

    return (
      <View style={styles.container}>
        <View style={styles.viewSearch}>
          <Hideo
            autoFocus={true}
            placeholder='¿Qué serie buscas?'
            iconClass={Icon}
            iconName={'md-search'}
            iconColor={'#616161'}
            iconBackgroundColor={'#ffffff'}
            inputStyle={styles.input}
            clearButtonMode={'always'}
            onChangeText={ (text)=> this.setState({searchText: text}) }
            onSubmitEditing={ () => this.onBuscarBtnPressed() }
          />
        </View>

        {spinner}

        <KeyboardAvoidingView behavior={'padding'} style={styles.viewBody}>
          <Animated.View style={[{opacity: this.state.listviewOpacity}, styles.viewBody]}>
            <ListView
              dataSource={this.state.dataSource}
              renderHeader={() => this.renderHeader()}
              renderRow={(rowData) => this.renderRow(rowData)}
              renderFooter={() => this.renderFooter()}
              enableEmptySections={true}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

var NavigationBarRouteMapper = {
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
    //marginRight: 5,
    fontFamily: 'Roboto-Light'
  },
  rowTouch: {
    flex: 1,
    borderRadius: 2,
    elevation: 2,
    backgroundColor: '#fafafa',
    margin: 12,
    marginTop: 8,
    marginBottom: -2,
    borderRadius: 2
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
    marginBottom: 10
  },
  rating: {
    flexDirection: 'row'
  },
  ratingText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#616161',
    marginRight: 3
  },
  ratingIcon: {
    marginTop: 1,
    fontSize: 14,
    color: '#616161'
  },
  separatorView: {
    height: 54
  },
  loader: {
    marginTop: 20
  }
});

export default Search;

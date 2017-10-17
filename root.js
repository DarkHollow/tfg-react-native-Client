import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  StatusBar,
  Platform,
  TouchableNativeFeedback,
  TextInput,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const InitialNavBarElementsOpacity = 1;
const InitialSearchMarginTop = 10;
const InitialSearchMarginRight = 50;
const InitialSearchHeight = 30;
const InitialSearchWidth = 170;
const InitialSearchBorderRadius = 3;

class Root extends Component {

  constructor() {
    super();
    this.state = {
      navBarElementsOpacity: new Animated.Value(InitialNavBarElementsOpacity),
      searchMarginTop: new Animated.Value(InitialSearchMarginTop),
      searchMarginRight: new Animated.Value(InitialSearchMarginRight),
      searchHeight: new Animated.Value(InitialSearchHeight),
      searchWidth: new Animated.Value(InitialSearchWidth),
      searchBorderRadius: new Animated.Value(InitialSearchBorderRadius),
    }
  }

  navigateTo(route, reset) {
    this.props.navigator.push({
      name: route, reset: reset
    });
  }

  async logout() {
    console.log("logout");
    try {
      await AsyncStorage.multiRemove(['jwt', 'userId', 'userName']).then(() => {
        console.log('Storage sesión eliminada');
      }).done();
      // token borrado, navegamos a login
      this.navigateTo('login', true);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  onSearchFocus() {
    const {height, width} = Dimensions.get('window');

    Animated.parallel([
      Animated.timing(this.state.navBarElementsOpacity, {
        toValue: 0,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchMarginTop, {
        toValue: 0,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchMarginRight, {
        toValue: 0,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchHeight, {
        toValue: 50,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchWidth, {
        toValue: width,
        easing: Easing.bouce,
        duration: 200
      }),
      Animated.timing(this.state.searchBorderRadius, {
        toValue: 0,
        easing: Easing.bouce,
        duration: 200
      })
    ]).start( () => {
      this.navigateTo('search', false);

      setTimeout(() => {
        this.setState({
          navBarElementsOpacity: new Animated.Value(InitialNavBarElementsOpacity),
          searchMarginTop: new Animated.Value(InitialSearchMarginTop),
          searchMarginRight: new Animated.Value(InitialSearchMarginRight),
          searchHeight: new Animated.Value(InitialSearchHeight),
          searchWidth: new Animated.Value(InitialSearchWidth),
          searchBorderRadius: new Animated.Value(InitialSearchBorderRadius),
        });
      }, 500);
    });
  }

  render() {
    let { navBarElementsOpacity, searchHeight, searchWidth, searchMarginTop, searchMarginRight, searchBorderRadius } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar
          animated
          translucent
          barStyle="light-content"
          backgroundColor={'transparent'}
          hidden
        />

        <View style={styles.navBarView}>
          <Animated.Text style={[styles.navBarTitle, {opacity: navBarElementsOpacity}]}>Principal</Animated.Text>
          <Animated.View style={[styles.searchView,
                                  {height: searchHeight, width: searchWidth, top: searchMarginTop, right: searchMarginRight, borderRadius: searchBorderRadius}
                                ]}>
            <Icon style={styles.searchIcon}
                  name={(Platform.OS === 'ios') ? 'ios-search-outline' : 'md-search'} />
            <TextInput
              placeholder='Buscar serie'
              placeholderTextColor={'rgba(255,255,255,0.4)'}
              style={styles.inputSearch}
              underlineColorAndroid={'transparent'}
              autoCorrect={false}
              onFocus={ this.onSearchFocus.bind(this, 'search', false) }
            />
          </Animated.View>
          {(Platform.OS === 'ios') ?
            <Animated.View style={[styles.accountButtonView, {opacity: navBarElementsOpacity}]}>
              <TouchableHighlight onPress={ () => this.logout().done() } underlayColor={'rgba(255,179,0,1)'}>
                <Icon style={styles.accountButtonIcon} name={'ios-log-out'} />
              </TouchableHighlight>
            </Animated.View>
            :
            <Animated.View style={[styles.accountButtonView, {opacity: navBarElementsOpacity}]}>
              <TouchableNativeFeedback
                onPress={ () => this.logout().done() }
                delayPressIn={0}
                background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                <View>
                  <Icon style={styles.accountButtonIcon} name={'md-log-out'} />
                </View>
              </TouchableNativeFeedback>
            </Animated.View>
          }
        </View>


      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#212121',
  },
  navBarView: {
    height: 50,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    backgroundColor: '#2d2d2d',
    elevation: 1,
  },
  navBarTitle: {
    paddingLeft: 14,
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
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    position: 'absolute',
    alignSelf: 'center',
    paddingLeft: 14,
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  inputSearch: {
    flex: 1,
    margin: 0,
    padding: 0,
    paddingLeft: 38,
    color: 'white',
    paddingTop: 0,
  },
  accountButtonView: {
    position: 'absolute',
    right: 6,
    borderRadius: 100,
    ...Platform.select({
      android: {
        right: 10,
      },
    }),
  },
  accountButtonIcon: {
    fontSize: 26,
    color: 'rgba(255,255,255,0.76)',
    padding: 4,
    paddingLeft: 7,
    paddingRight: 7,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
        fontSize: 20,
      },
    }),
  },
  button: {
    height: 40,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    color: '#FFF',
    alignSelf: 'center'
  },
  inputView: {
    marginLeft: -12,
    height: 46,
    alignSelf: 'stretch',
  },
  input: {
    marginLeft: -20,
    height: 36,
    marginTop: 7,
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    borderRadius: 5,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
        fontSize: 16,
      },
    }),
  },
  submitButtonView: {
    marginTop: 30,
    alignSelf: 'stretch',
    borderRadius: 5,
    elevation: 3,
  },
  submitButton: {
    alignSelf: 'stretch',
    borderRadius: 5,
    padding: 8,
    backgroundColor: 'rgba(255,149,0,1)',
  },
  principalButtonText: {
    color: 'rgba(0,0,0,0.87)',
    textAlign: 'center',
    fontSize: 17,
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
  },
  buttonPrueba: {
    color: 'red',
    backgroundColor: 'green'
  }
});

export default Root;

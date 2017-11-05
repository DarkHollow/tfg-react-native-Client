import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableNativeFeedback,
  TouchableHighlight,
  Easing,
  Modal,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ichigo } from 'react-native-textinput-effects';
import cryptojs from 'crypto-js';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      emailText: '',
      passwordText: '',
      modalVisible: false,
      redirectModalVisible: false,
      gridBackgroundOpacity: new Animated.Value(0),
      letterOpacity: new Animated.Value(50),
    }
  }

  // animacion imagen
  onBackgroundLoadEnded() {
    Animated.timing(this.state.gridBackgroundOpacity, {
      toValue: 0.10,
      duration: 1000
    }).start();
  }

  // animaciones letra titulo
  animateLetterOpacityOut(value) {
    Animated.timing(this.state.letterOpacity, {
      toValue: 1,
      easing: Easing.elastic(value),
      duration: 300,
    }).start(() => this.animateLetterOpacityIn(Math.random() * 100 + 200));
  }

  animateLetterOpacityIn(value) {
    Animated.timing(this.state.letterOpacity, {
      toValue: value,
      duration: 1000
    }).start( () => setTimeout(() => this.animateLetterOpacityOut(Math.random() * 4 + 1), Math.random() * 2000 + 1000));
  }

  // funcion para validar un email
  validateEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  // mostrar u ocultar modal: mostrar/ocultar, titulo, mensaje, mostrar/ocultar spinner
  setModalVisible(visible, title, message, loading, buttons) {
    this.setState({modalTitle: title});
    this.setState({modalMessage: message});
    this.setState({modalLoading: loading});
    this.setState({modalButtons: buttons});
    this.setState({modalVisible: visible});
  }

  showAndHideModal(visible, title, message, loading) {
    this.setModalVisible(visible, title, message, loading);
    setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
  }

  showButtonsModal(title, message, buttons) {
    this.setModalVisible(true, title, message, null, buttons)
  }

  async storeSession(data) {
    try {
      await AsyncStorage.multiSet([
        ['jwt', data.Authorization],
        ['userId', data.userId.toString()],
        ['userName', data.userName]
      ]);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }

  // procesamos los datos que nos devuelve la API
  processLoginResponse(data) {
    console.log('processLoginResponse');
    // si la API nos devuelve error
    if (data.error) {
      this.showAndHideModal(true, 'Entrar', data.message, false);
    } else if (data.ok !== undefined) {
      // se ha hecho login
      // guardamos token
      this.storeSession(data).then(() => {
        this.showAndHideModal(true, 'Entrar', 'Has iniciado sesión correctamente', false);
        // navegamos a la app
        setTimeout(() => this.navigateTo('root', true), 2100);
      });
    } else {
      this.showAndHideModal(true, 'Entrar', 'Prueba de nuevo más tarde', false);
    }
  }

  onSubmit() {
    console.log('Inicio de sesión de ' + this.state.emailText);
    this.setModalVisible(true, 'Entrar', 'Iniciando sesión...', true);

    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/users/session' : 'http://192.168.1.13:9000/api/users/session';

    let email = this.state.emailText;
    let password = this.state.passwordText;

    // comprobar longitud email
    if (email.length >= 3) {
      // intentamos validar email
      if (this.validateEmail(email)) {
        // comprobar longitud password
        if (password.length >= 6 && password.length <= 14) {
          let hash = cryptojs.SHA512(password);
          // intentamos login -> hacemos fetch a la API
          console.log('fetch');

          fetch(URL, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              password: hash.toString(),
            })
          }).then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              console.log("not ok");
            }
          }).then((responseData) => {
            this.processLoginResponse(responseData);
          }).catch((error) => {
            this.showAndHideModal(true, 'Entrar', 'Lamentablemente no se ha podido iniciar sesión', false);
          });
        } else {
          // longitud password
          this.showAndHideModal(true, 'Entrar', 'La contraseña debe contener entre 6 y 14 caracteres', false);
          this._textInputPass.focus();
        }
      } else {
        // email no valido
        this.showAndHideModal(true, 'Entrar', 'El formato de email no es válido', false);
        this._textInputEmail.focus();
      }
    } else {
      // email vacio ?
      this.showAndHideModal(true, 'Entrar', 'El email no es válido', false);
      this._textInputEmail.focus();
    }
  }

  navigateTo(route, reset) {
    this.props.navigator.push({
      name: route, reset: reset
    });
  }

  componentDidMount() {
    this.animateLetterOpacityIn(300);
  }

  render() {
    return(
      <View style={styles.statusBarAndNavView}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} hidden animated />
        <CustomComponents.Navigator
          renderScene={this.renderScene.bind(this)}
          navigator={this.props.navigator}
          navigationBar={
            null
          }
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
              {(this.state.modalLoading) ? (
                <View style={styles.modalBottom}>
                  <ActivityIndicator style={styles.modalLoader}
                                     size={'small'} color={'rgba(255,149,0,1)'} />
                </View>
              ) : ( null )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  renderScene(route, navigator) {

    const letterOpacity = this.state.letterOpacity.interpolate({
      inputRange: [0, 300],
      outputRange: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,1.0)']
    });

    return (
      <LinearGradient style={styles.container}
                      start={{x: 1, y: 0}} end={{x: 0.2, y: 1}}
                      colors={['#1d1d1d', '#303030']}>
        <Animated.Image style={[{opacity: this.state.gridBackgroundOpacity}, styles.gridImage]}
               onLoadEnded={this.onBackgroundLoadEnded()}
               blurRadius={8}
               source={require('./img/gridBackground.png')}
               resizeMode={'cover'} />
          <View style={styles.separator} />
          <View style={styles.viewColumn}>
            <KeyboardAvoidingView behavior={'padding'} style={styles.viewBody}>
              <View style={styles.principalView}>
                <Text style={styles.principalTitleText}>Tr<Animated.Text style={{color: letterOpacity}}>e</Animated.Text>nding <Text style={styles.principalTitleSecondText}>Series</Text></Text>
                <Text style={styles.principalText}>Inicia sesión para acceder a la aplicación</Text>
                <View style={styles.inputView}>
                  <Ichigo
                    ref={component => this._textInputEmail = component}
                    placeholder={'Correo electrónico'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={(Platform.OS === 'ios') ? 'rgba(255,149,0,1)' : 'rgba(255,149,0,0.5)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'email-address'}
                    returnKeyType={'next'}
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-mail-outline' : 'md-mail'}
                    iconColor={'rgba(255,255,255,0.6)'}
                    iconBackgroundColor={'transparent'}
                    iconPaddingTop={3}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({emailText: text}) }
                    onSubmitEditing={() => this._textInputPass.focus() }
                  />
                </View>
                <View style={styles.inputView}>
                  <Ichigo
                    ref={component => this._textInputPass = component}
                    placeholder={'Contraseña'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={(Platform.OS === 'ios') ? 'rgba(255,149,0,1)' : 'rgba(255,149,0,0.5)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'default'}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    secureTextEntry
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-lock-outline' : 'md-lock'}
                    iconColor={'rgba(255,255,255,0.6)'}
                    iconBackgroundColor={'transparent'}
                    iconPaddingTop={2}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({passwordText: text}) }
                    onSubmitEditing={() => this.onSubmit() }
                  />
                </View>

                {(Platform.OS === 'ios') ?
                  <View style={styles.submitButtonView}>
                    <TouchableHighlight style={styles.submitButton}
                             onPress={ () => { this.onSubmit() }} underlayColor={'rgba(255,179,0,1)'}>
                      <Text style={styles.principalButtonText}>Entrar</Text>
                    </TouchableHighlight>
                  </View>
                :
                  <View style={styles.submitButtonView}>
                    <TouchableNativeFeedback
                      onPress={() => { this.onSubmit() }}
                      delayPressIn={0}
                      background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                      <View style={styles.submitButton}>
                        <Text style={styles.principalButtonText}>Entrar</Text>
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                }
              </View>
            </KeyboardAvoidingView>

            <View style={styles.bottomView}>
              <Text style={styles.bottomText}>¿No tienes cuenta?</Text>
              <Text style={styles.bottomButtonText} onPress={ () => this.navigateTo('register')}>Regístrate</Text>
            </View>
          </View>
          <View style={styles.separator} />
      </LinearGradient>

    );
  }
}

const styles = StyleSheet.create({
  statusBarAndNavView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
    flexDirection: 'row',
  },
  gridImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    padding: 0,
    width: null,
    height: null,
  },
  separator: {
    flex: 0.07,
  },
  viewColumn: {
    flex: 0.86,
    flexDirection: 'column',
  },
  viewBody: {
    flex: 5,
    backgroundColor: 'transparent',
  },
  principalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  principalTitleText: {
    marginBottom: 20,
    fontFamily: 'Blacklisted',
    fontSize: 40,
    color: 'rgba(255,255,255,1)',
    ...Platform.select({
      ios: {
        paddingTop: 10,
      },
    }),
  },
  principalTitleSecondText: {
    color: 'rgba(255,149,0,1)',
  },
  lightOff: {
    color: 'rgba(255,255,255,0.35)',
  },
  principalText: {
    marginBottom: 20,
    color: 'rgba(255,255,255,0.70)',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
  },
  inputView: {
    marginLeft: -12,
    height: 53,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  input: {
    marginLeft: -20,
    height: 51,
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    borderRadius: 5,
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Light',
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
  bottomView: {
    flex: 1,
    marginLeft: -100,
    marginRight: -100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
    ...Platform.select({
      android: {
        paddingBottom: 70,
      },
    }),
  },
  bottomButton: {
    borderRadius: 5,
    padding: 6,
    paddingRight: 9,
    paddingLeft: 9,
  },
  bottomText: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.87)',
  },
  bottomButtonText: {
    backgroundColor: 'transparent',
    fontSize: 17,
    color: 'rgba(255,149,0,1)',
    ...Platform.select({
      ios: {
        fontWeight: '600',
      },
      android: {
        fontFamily: 'Roboto-Medium',
      },
    }),
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
    backgroundColor: '#1f1f1f',
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
    paddingBottom: 40,
    borderColor: 'rgba(245,245,245,0.05)',
    borderTopWidth: 0.5
  },
  modalLoader: {
    position: 'absolute',
    marginTop: 10,
    padding: 0,
  },
});

export default Login;

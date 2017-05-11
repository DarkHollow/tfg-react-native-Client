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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ichigo } from 'react-native-textinput-effects';
import cryptojs from 'crypto-js';

class Register extends Component {
  constructor() {
    super();
    this.state = {
      emailText: '',
      password1Text: '',
      password2Text: '',
      nameText: '',
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
  setModalVisible(visible, title, message, loading) {
    this.setState({modalTitle: title});
    this.setState({modalMessage: message});
    this.setState({modalLoading: loading});
    this.setState({modalVisible: visible});
  }

  // procesamos los datos que nos devuelve la API
  processRegisterResponse(data) {
    console.log('processRegisterResponse');

    // si la API nos devuelve que no ha encontrado nada
    if (data.error) {
      this.setModalVisible(true, 'Registro', data.message, false);
      setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
    } else if (data.ok !== undefined) {
      // se ha hecho el registro, redirigimos a vista de login
      this.setModalVisible(true, 'Registro', 'Te has registrado correctamente', false);
      setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
      setTimeout(() => this.navigateTo('login'), 2100);
    } else {
      this.setModalVisible(true, 'Registro', 'Ha habido un error, inténtalo más tarde', false);
      setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
    }
  }

  onSubmit() {
    console.log('Registro de ' + this.state.emailText);
    this.setModalVisible(true, 'Registro', 'Registrando usuario...', true);

    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/user/' : 'http://192.168.1.13:9000/api/user/';

    let email = this.state.emailText;
    let password1 = this.state.password1Text;
    let password2 = this.state.password2Text;
    let name = this.state.nameText;

    // comprobar longitud email
    if (email.length >= 3) {
      // intentamos validar email
      if (this.validateEmail(email)) {
        // comprobar longitud password
        if (password1.length >= 6 && password1.length <= 14) {
          // comprobar si las contraseñas coinciden
          if (password1 === password2) {
            // comprobar longitud nombre
            if (name.length >= 3 && name.length <= 20) {
              // calculamos hash de la contraseña
              let hash = cryptojs.SHA512(password1);
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
                  name: name,
                })
              }).then((response) => response.json())
                .finally((responseData) => {
                  this.processRegisterResponse(responseData);
                }).catch((error) => {
                console.error(error);
                this.setModalVisible(true, 'Registro', 'Lamentablemente no se ha podido identificar', false);
                setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
              });
            } else {
              // longitud nombre invalida
              this.setModalVisible(true, 'Registro', 'El nombre debe tener entre 3 y 24 caracteres', false);
              setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
              this._textInputName.focus();
            }
          } else {
            // los passwords no coinciden
            this.setModalVisible(true, 'Registro', 'Las contraseñas no coiciden', false);
            setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
          }
        } else {
          // longitud password 1
          this.setModalVisible(true, 'Registro', 'La contraseña debe contener entre 6 y 14 caracteres', false);
          setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
          this._textInputPass1.focus();
        }
      } else {
        // email no valido
        this.setModalVisible(true, 'Registro', 'El formato de email no es válido', false);
        setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
        this._textInputEmail.focus();
      }
    } else {
      // email vacio ?
      this.setModalVisible(true, 'Registro', 'El email no es válido', false);
      setTimeout(() => this.setModalVisible(false, '', '', false), 2000);
      this._textInputEmail.focus();
    }
  }

  navigateTo(route) {
    this.props.navigator.resetTo({
      name: route
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
                  <ActivityIndicator style={styles.loader}
                                     size={'small'} color={'#fe3f80'} />
                </View>
              ) : ( null )}
            </View>
          </View>
        </Modal>

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
                <Text style={styles.principalText}>Regístrate para poder acceder a la aplicación</Text>
                <View style={styles.inputView}>
                  <Ichigo
                    ref={component => this._textInputEmail = component}
                    placeholder={'Correo electrónico'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={'rgba(255,149,0,1)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'email-address'}
                    returnKeyType={'next'}
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-mail-outline' : 'md-mail'}
                    iconColor={'rgba(255,255,255,0.5)'}
                    iconBackgroundColor={'transparent'}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({emailText: text}) }
                    onSubmitEditing={() => this._textInputPass1.focus() }
                  />
                </View>
                <View style={styles.inputView}>
                  <Ichigo
                    ref={component => this._textInputPass1 = component}
                    placeholder={'Contraseña'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={'rgba(255,149,0,1)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'default'}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    secureTextEntry
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-lock-outline' : 'md-lock'}
                    iconColor={'rgba(255,255,255,0.5)'}
                    iconBackgroundColor={'transparent'}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({password1Text: text}) }
                    onSubmitEditing={() => this._textInputPass2.focus() }
                  />
                </View>
                <View style={styles.inputView}>
                  <Ichigo
                    ref={component => this._textInputPass2 = component}
                    placeholder={'Confirma la contraseña'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={'rgba(255,149,0,1)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'default'}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    secureTextEntry
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-lock-outline' : 'md-lock'}
                    iconColor={'rgba(255,255,255,0.5)'}
                    iconBackgroundColor={'transparent'}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({password2Text: text}) }
                    onSubmitEditing={() => this._textInputName.focus() }
                  />
                </View>
                <View style={styles.inputView}>
                  <Ichigo
                    ref={component => this._textInputName = component}
                    placeholder={'Nombre'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={'rgba(255,149,0,1)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'words'}
                    autoCorrect={false}
                    keyboardType={'default'}
                    returnKeyType={'go'}
                    blurOnSubmit={false}
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-person-outline' : 'md-person'}
                    iconColor={'rgba(255,255,255,0.5)'}
                    iconBackgroundColor={'transparent'}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({nameText: text}) }
                    onSubmitEditing={ () => this.onSubmit() }
                  />
                </View>
                {(Platform.OS === 'ios') ?
                  <View style={styles.submitButtonView}>
                    <TouchableHighlight style={styles.submitButton}
                             onPress={ () => { this.onSubmit() }} underlayColor={'rgba(255,179,0,1)'}>
                      <Text style={styles.principalButtonText}>Registrarse</Text>
                    </TouchableHighlight>
                  </View>
                :
                  <View style={styles.submitButtonView}>
                    <TouchableNativeFeedback
                      onPress={() => { this.onSubmit() }}
                      delayPressIn={0}
                      background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                      <View style={styles.submitButton}>
                        <Text style={styles.principalButtonText}>Registrarse</Text>
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                }
              </View>
            </KeyboardAvoidingView>

            <View style={styles.bottomView}>
              <Text style={styles.bottomText}>¿Ya tienes cuenta?</Text>
              <Text style={styles.bottomButtonText} onPress={ () => this.navigateTo('login')}>Entrar</Text>
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
    height: 46,
    alignSelf: 'stretch',
    //borderBottomWidth: 0.5,
    //borderColor: 'rgba(255,255,255,0.5)',
  },
  input: {
    marginLeft: -20,
    height: 36,
    marginTop: 7,
    backgroundColor: 'transparent',//backgroundColor: 'rgba(255,255,255,0.07)',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  innerModal: {
    paddingTop: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 3,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 3,
  },
  modalMessage: {
    fontSize: 13,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  modalBottom: {
    alignSelf: 'stretch',
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 0.5,
    borderColor: '#dddddd'
  },
});

export default Register;

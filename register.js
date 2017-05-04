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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ichigo } from 'react-native-textinput-effects';

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

  // animacion letra titulo
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

  onSubmit() {
    // TODO procesar registro
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
                <Text style={styles.principalText}>Regístrate para poder acceder a la aplicación.</Text>
                <View style={styles.inputView}>
                  <Ichigo
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
                  />
                </View>
                <View style={styles.inputView}>
                  <Ichigo
                    placeholder={'Contraseña'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={'rgba(255,149,0,1)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'default'}
                    returnKeyType={'next'}
                    secureTextEntry
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-lock-outline' : 'md-lock'}
                    iconColor={'rgba(255,255,255,0.5)'}
                    iconBackgroundColor={'transparent'}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({password1Text: text}) }
                  />
                </View>
                <View style={styles.inputView}>
                  <Ichigo
                    placeholder={'Repite contraseña'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={'rgba(255,149,0,1)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'default'}
                    returnKeyType={'next'}
                    secureTextEntry
                    iconClass={Icon}
                    iconName={(Platform.OS === 'ios') ? 'ios-lock-outline' : 'md-lock'}
                    iconColor={'rgba(255,255,255,0.5)'}
                    iconBackgroundColor={'transparent'}
                    inputStyle={styles.input}
                    clearButtonMode={'while-editing'}
                    onChangeText={ (text) => this.setState({password2Text: text}) }
                  />
                </View>
                <View style={styles.inputView}>
                  <Ichigo
                    placeholder={'Nombre'}
                    placeholderTextColor={'rgba(255,255,255,0.4)'}
                    selectionColor={'rgba(255,149,0,1)'}
                    underlineColor={['rgba(255,255,255,0.5)', 'rgba(255,149,0,1)']}
                    autoCapitalize={'words'}
                    autoCorrect={false}
                    keyboardType={'default'}
                    returnKeyType={'go'}
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
              <Text style={styles.bottomButtonText}>Identifícate</Text>
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
});

export default Register;

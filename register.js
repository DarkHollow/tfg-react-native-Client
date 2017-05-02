import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableNativeFeedback
} from 'react-native';
import CustomComponents from 'react-native-deprecated-custom-components';
import Icon from 'react-native-vector-icons/Ionicons';
import { Hideo } from 'react-native-textinput-effects';

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
    }
  }

  onSubmit() {
    // TODO procesar registro
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
    return (
      <View style={styles.container}>

        <KeyboardAvoidingView behavior={'padding'} style={styles.viewBody}>
          <View style={styles.principalView}>
            <Text style={styles.principalTitleText}>Trending Series</Text>
            <Text style={styles.principalText}>Regístrate para poder acceder a la aplicación.</Text>
            <View style={styles.inputView}>
              <Hideo
                placeholder={'Correo electrónico'}
                placeholderTextColor={'#b2b2b2'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'email-address'}
                returnKeyType={'next'}
                iconClass={Icon}
                iconName={(Platform.OS === 'ios') ? 'ios-mail-outline' : 'md-mail'}
                iconColor={(Platform.OS === 'ios') ? '#616161' : '#919191'}
                iconBackgroundColor={'#eeeeee'}
                inputStyle={styles.input}
                clearButtonMode={'while-editing'}
                onChangeText={ (text) => this.setState({emailText: text}) }
              />
            </View>
            <View style={styles.inputView}>
              <Hideo
                placeholder={'Contraseña'}
                placeholderTextColor={'#b2b2b2'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'default'}
                returnKeyType={'next'}
                secureTextEntry
                iconClass={Icon}
                iconName={(Platform.OS === 'ios') ? 'ios-lock-outline' : 'md-lock'}
                iconColor={(Platform.OS === 'ios') ? '#616161' : '#919191'}
                iconBackgroundColor={'#eeeeee'}
                inputStyle={styles.input}
                clearButtonMode={'while-editing'}
                onChangeText={ (text) => this.setState({password1Text: text}) }
              />
            </View>
            <View style={styles.inputView}>
              <Hideo
                placeholder={'Repite contraseña'}
                placeholderTextColor={'#b2b2b2'}
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'default'}
                returnKeyType={'next'}
                secureTextEntry
                iconClass={Icon}
                iconName={(Platform.OS === 'ios') ? 'ios-lock-outline' : 'md-lock'}
                iconColor={(Platform.OS === 'ios') ? '#616161' : '#919191'}
                iconBackgroundColor={'#eeeeee'}
                inputStyle={styles.input}
                clearButtonMode={'while-editing'}
                onChangeText={ (text) => this.setState({password2Text: text}) }
              />
            </View>
            <View style={styles.inputView}>
              <Hideo
                placeholder={'Nombre'}
                placeholderTextColor={'#b2b2b2'}
                autoCapitalize={'words'}
                autoCorrect={false}
                keyboardType={'default'}
                returnKeyType={'go'}
                iconClass={Icon}
                iconName={(Platform.OS === 'ios') ? 'ios-person-outline' : 'md-person'}
                iconColor={(Platform.OS === 'ios') ? '#616161' : '#919191'}
                iconBackgroundColor={'#eeeeee'}
                inputStyle={styles.input}
                clearButtonMode={'while-editing'}
                onChangeText={ (text) => this.setState({nameText: text}) }
                onSubmitEditing={ () => this.onSubmit() }
              />
            </View>
            {(Platform.OS === 'ios') ?
              <View style={styles.submitButtonView}>
                <Icon.Button name='ios-log-in-outline' size={24} iconStyle={{marginTop: 2,}} color={'#616161'} style={styles.submitButton}
                             onPress={ () => { this.onSubmit() }} underlayColor={'white'}>
                  <Text style={styles.principalButtonText}>Registrarse</Text>
                </Icon.Button>
              </View>
            :
              <View style={styles.submitButtonView}>
                <TouchableNativeFeedback
                  onPress={() => { this.onSubmit() }}
                  background={TouchableNativeFeedback.Ripple('#ff77a7', true)}>
                  <View style={styles.submitButton}>
                    <Icon name='md-log-in' size={14} style={styles.loginIcon} color={'#616161'}>
                      <Text style={styles.principalButtonText}> Registrarse</Text>
                    </Icon>
                  </View>
                </TouchableNativeFeedback>
              </View>
            }
          </View>
        </KeyboardAvoidingView>
      </View>

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
  },
  viewBody: {
    flex: 1,
    backgroundColor: '#eeeeee',
    paddingLeft: 20,
    paddingRight: 20,
  },
  principalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  principalTitleText: {
    marginBottom: 20,
    fontSize: 20,
    color: 'black',
  },
  principalText: {
    marginBottom: 20,
    color: '#616161',
  },
  inputView: {
    height: 40,
    marginLeft: 10,
    marginRight: 30,
    alignSelf: 'stretch',
  },
  input: {
    height: 30,
    marginTop: 10,
    backgroundColor: '#e6e6e6',
    color: '#616161',
    fontSize: 14,
    borderRadius: 5,
  },
  submitButtonView: {
    marginLeft: 20,
    marginRight: 30,
    marginTop: 20,
    alignSelf: 'stretch',
    borderRadius: 5,
    elevation: 3,
  },
  submitButton: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#d5d5d5',
    ...Platform.select({
      ios: {
        paddingTop: 1,
        paddingBottom: 1,
      },
      android: {
        padding: 4,
      }
    }),
  },
  loginIcon: {
    color: '#616161',
    alignSelf: 'center',
    padding: 4,
    fontSize: 14,
  },
  principalButtonText: {
    fontSize: 14,
    color: '#616161',
    ...Platform.select({
      android: {
        fontFamily: 'Roboto-Regular',
      },
    }),
  },
});

export default Register;

import React, {Component} from 'react';
import {Animated, Image, Platform, StyleSheet, Text, View, TouchableOpacity, TouchableNativeFeedback, Modal, Button} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class EpisodeCollapse extends Component {
  constructor(props) {
    super(props);

    this.state = {
      index       : props.index,
      jwt         : props.jwt,
      number      : props.number,
      name        : props.title,
      screenshot  : props.screenshot,
      date        : props.date,
      seen        : props.seen,
      expanded    : false,
      animation   : new Animated.Value(),
      modalVisible: false,
    };
  }

  toggle(){
    let initialValue = this.state.expanded ? this.state.maxHeight + this.state.minHeight : this.state.minHeight;
    let finalValue   = this.state.expanded ? this.state.minHeight : this.state.maxHeight + this.state.minHeight;

    this.setState({
      expanded: !this.state.expanded,
    });

    this.state.animation.setValue(initialValue);
    Animated.spring(this.state.animation, {
      toValue: finalValue,
    }).start();
  }

  _setMaxHeight(event) {
    if (!this.state.maxHeight) {
      this.setState({
        maxHeight: event.nativeEvent.layout.height,
      });
    }
  }

  _setMinHeight(event){
    if (!this.state.minHeight) {
      this.setState({
        minHeight: event.nativeEvent.layout.height,
        animation: new Animated.Value(event.nativeEvent.layout.height),
      });
    }
  }

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

  dismissModal() {
    this.setModalVisible(false, '', '', false, null);
  }

  onMore(seen) {
    // de momento no hay más acciones así que marcar como visto/no visto
    if (seen) {
      this.showButtonsModal('Marcar como no visto ', '¿Deseas marcar el episodio como no visto?', 'setUnseen');
    } else {
      this.showButtonsModal('Marcar como visto ', '¿Deseas marcar el episodio como visto?', 'setSeen');
    }
  }

  setSeen() {
    this.setSeenFetch('PUT');
  }

  setUnseen() {
    this.setSeenFetch('DELETE');
  }

  setSeenFetch(method) {
    // segun la plataforma, url
    const URL = (Platform.OS === 'ios') ?
      'http://localhost:9000/api/tvshows/' : 'http://192.168.1.13:9000/api/tvshows/';
    const ACTION = this.props.tvShowId + '/seasons/' + this.props.seasonNumber + '/episodes/' + this.props.number + '/seen';

    // hacemos fetch a la API
    fetch(URL + ACTION, {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + this.state.jwt,
      }
    }).then(function (response) {
      if (response.status === 200) {
        this.onRefresh();

      } else {
        console.log(response.status);
      }
    }.bind(this)).then(() => {
      this.dismissModal();
    }).catch((error) => {
      console.log(error.stack);
      // mostrar toast ?
      this.dismissModal();
    });
  }

  onRefresh = () => {
    const { refresh } = this.props;
    refresh();
  };

  render() {
    // definición de los botones de los Modal

    // botones del Modal
    let modalButtons = null;
    if (this.state.modalButtons !== null && this.state.modalButtons !== undefined) {
      modalButtons = [];
      switch (this.state.modalButtons) {
        case 'setSeen':
          modalButtons.push(
            (Platform.OS === 'ios') ? (
              <View style={styles.modalBottomButtonView} key={1}>
                <Button
                  onPress={ this.setSeen.bind(this) }
                  title={'Sí'.toUpperCase()}
                  color={'rgba(255,149,0,1)'}
                />
              </View>
            ) : (
              <View style={styles.modalBottomButtonView} key={1}>
                <TouchableNativeFeedback
                  onPress={ this.setSeen.bind(this) }
                  background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                  <View style={styles.modalBottomButton}>
                    <Text style={styles.modalBottomButtonText}>{'Sí'.toUpperCase()}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            )
          );
          modalButtons.push(
            (Platform.OS === 'ios') ? (
              <View style={styles.modalBottomButtonView} key={2}>
                <Button
                  onPress={ this.dismissModal.bind(this) }
                  title={'Cancelar'.toUpperCase()}
                  color={'rgba(255,149,0,1)'}
                  bold
                />
              </View>
            ) : (
              <View style={styles.modalBottomButtonView} key={2}>
                <TouchableNativeFeedback
                  onPress={ this.dismissModal.bind(this) }
                  background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                  <View style={styles.modalBottomButton}>
                    <Text style={styles.modalBottomButtonText}>{'Cancelar'.toUpperCase()}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            )
          );
          break;
        case 'setUnseen':
          modalButtons.push(
            (Platform.OS === 'ios') ? (
              <View style={styles.modalBottomButtonView} key={1}>
                <Button
                  onPress={ this.setUnseen.bind(this) }
                  title={'Sí'.toUpperCase()}
                  color={'rgba(255,149,0,1)'}
                />
              </View>
            ) : (
              <View style={styles.modalBottomButtonView} key={1}>
                <TouchableNativeFeedback
                  onPress={ this.setUnseen.bind(this) }
                  background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                  <View style={styles.modalBottomButton}>
                    <Text style={styles.modalBottomButtonText}>{'Sí'.toUpperCase()}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            )
          );
          modalButtons.push(
            (Platform.OS === 'ios') ? (
              <View style={styles.modalBottomButtonView} key={2}>
                <Button
                  onPress={ this.dismissModal.bind(this) }
                  title={'Cancelar'.toUpperCase()}
                  color={'rgba(255,149,0,1)'}
                  bold
                />
              </View>
            ) : (
              <View style={styles.modalBottomButtonView} key={2}>
                <TouchableNativeFeedback
                  onPress={ this.dismissModal.bind(this) }
                  background={TouchableNativeFeedback.Ripple('rgba(255,224,130,0.60)', true)}>
                  <View style={styles.modalBottomButton}>
                    <Text style={styles.modalBottomButtonText}>{'Cancelar'.toUpperCase()}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            )
          );
          break;
        default:
      }
    }

    return (
      <View style={styles.global}>
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
                      { modalButtons }
                    </View>
                  )}

                </View>
              ) : ( null )}
            </View>
          </View>
        </Modal>
        {(Platform.OS === 'ios') ? (
          <Animated.View style={[(this.state.expanded) ? styles.episodeExpanded : styles.episode, {height: this.state.animation}]}>
            <View style={styles.episodeRow}>
              <TouchableOpacity style={styles.episode} onPress={this.toggle.bind(this)}>
                <View style={styles.episodeInner} onLayout={this._setMinHeight.bind(this)}>
                  <View style={styles.episodeScreenshotView}>
                    <Image style={styles.episodeScreenshot}
                           source={this.props.screenshot}>
                      {!this.props.seen ? (
                        <Image style={styles.episodeScreenshotUnseen}
                                source={require('../img/unseen-screenshot.png')} />
                      ) : (
                        null
                      )}
                    </Image>
                  </View>
                  <View style={styles.episodeNameNumber}>
                    <Text style={styles.episodeName} numberOfLines={1}>{this.props.name}</Text>
                    <View style={styles.episodeSubtitle}>
                      <Text style={styles.episodeNumber}>Episodio {this.props.number}</Text>
                      <Text style={styles.episodeDate}>{this.props.date}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.episodeOptions}>
                <TouchableOpacity style={styles.more} onPress={this.onMore.bind(this, this.props.seen)}>
                  <Icon style={styles.eyeIcon}
                        name={(Platform.OS === 'ios') ? 'ios-more' : 'md-more'}>
                  </Icon>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
              {this.props.children}
            </View>
          </Animated.View>

        ) : (
            <Animated.View style={[(this.state.expanded) ? styles.episodeExpanded : styles.episode, {height: this.state.animation}]}>
              <View style={styles.episodeRow}>
                <TouchableNativeFeedback onLayout={this._setMinHeight.bind(this)}
                  onPress={this.toggle.bind(this)}
                  background={TouchableNativeFeedback.Ripple('rgba(255,149,0,1)', true)}
                  useForeground>
                  <View style={styles.episodeInner}>
                    <View style={styles.episodeScreenshotView}>
                      <Image style={styles.episodeScreenshot}
                             source={this.props.screenshot}>
                        {!this.props.seen ? (
                          <Image style={styles.episodeScreenshotUnseen}
                                 source={require('../img/unseen-screenshot.png')} />
                        ) : (
                          null
                        )}
                      </Image>
                    </View>
                    <View style={styles.episodeNameNumber}>
                      <Text style={styles.episodeName} numberOfLines={1}>{this.props.name}</Text>
                      <View style={styles.episodeSubtitle}>
                        <Text style={styles.episodeNumber}>Episodio {this.props.number}</Text>
                        <Text style={styles.episodeDate}>{this.props.date}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableNativeFeedback>
                <View style={styles.episodeOptions}>
                  <TouchableNativeFeedback onPress={ this.onMore.bind(this, this.props.seen) }
                                           background={TouchableNativeFeedback.Ripple('rgba(255,149,0,1)', true)}
                                           useForeground style={styles.more}>
                    <View style={styles.more}>
                      <Icon style={styles.eyeIcon}
                            name={(Platform.OS === 'ios') ? 'ios-more' : 'md-more'}>
                      </Icon>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </View>

              <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
                {this.props.children}
              </View>
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
                            { modalButtons }
                          </View>
                        )}

                      </View>
                    ) : ( null )}
                  </View>
                </View>
              </Modal>
            </Animated.View>
          )}
      </View>
      );
  }
}

let styles = StyleSheet.create({
  body: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  episode: {
    flex: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow:'hidden',
  },
  episodeExpanded: {
    flex: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow:'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeInner: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    paddingRight: 5,
    alignItems: 'center',
  },
  episodeScreenshotView: {
    width: 80,
    height: 45.04,
  },
  episodeScreenshot: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    borderRadius: 3,
  },
  episodeScreenshotUnseen: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    opacity: 0.76,
  },
  episodeNameNumber: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
  },
  episodeName: {
    color: '#dadade',
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.4,
    paddingRight: 5,
  },
  episodeSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  episodeNumber: {
    color: 'rgba(255, 255, 255, 0.66)',
  },
  episodeDate: {
    color: 'rgba(255, 255, 255, 0.66)',
    fontSize: 13,
  },
  episodeOptions: {
    ...Platform.select({
      ios: {
        paddingRight: 10,
      },
      android: {
        width: 30,
        alignItems: 'flex-end',
      },
    }),
  },
  more: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        width: 30,
      },
    }),
  },
  eyeIcon: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 24,
  },
  modal: {
    flex: 1,
    padding: 50,
    backgroundColor: 'rgba(23,23,23,0.7)',
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

export default EpisodeCollapse;
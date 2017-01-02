import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  ListView
} from 'react-native';

class SearchResults extends Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      showProgress: false,
      dataSource: ds.cloneWithRows(this.props.responseData),
    }
  }

  render() {
    return(
      <Navigator
        renderScene={this.renderScene.bind(this)}
        navigator={this.props.navigator}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper} />
        }
      />
    );
  }

  renderScene(route, navigator) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>
          Búsqueda: {this.props.searchText}
        </Text>

        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>{rowData.seriesName}</Text>
          }
        />
      </View>
    );
  }
}

var NavigationBarRouteMapper = {
  LeftButton(route, navigator, index, navState) {
    return (
      <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}
          onPress={() => navigator.parentNavigator.pop()}>
        <Text style={{margin: 10,}}>
          &lt; Volver
        </Text>
      </TouchableOpacity>
    );
  },
  RightButton(route, navigator, index, navState) {
    return null;
  },
  Title(route, navigator, index, navState) {
    return null;/*(
      <TouchableOpacity style={{flex: 1, justifyContent: 'center'}}>
        <Text style={{color: 'white', margin: 10, fontSize: 16}}>
          Buscar serie
        </Text>
      </TouchableOpacity>
    );*/
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#fafafa',
    padding: 10,
    paddingTop: 80
  },
  h1: {
    fontSize: 20,
    justifyContent: 'center',
    marginBottom: 6
  },
  loader: {
    marginTop: 20
  },
  list: {
    alignSelf: 'auto'
  }
});

export default SearchResults;

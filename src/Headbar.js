import React, {Component} from 'react';
import {Icon} from 'native-base';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';

class HeadBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }
  toggleDrawer = () => {
    //Props to open/close the drawer
    this.props.navigationProps.toggleDrawer();
  };
  render() {
    return (
      <View
        style={{
          flex: 0.1,
          flexDirection: 'row-reverse',
          backgroundColor: '#00BCD4',
          justifyContent: 'space-between',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <TouchableOpacity
          onPress={this.toggleDrawer.bind(this)}
          style={{paddingRight: '4%'}}>
          <Icon name="menu" style={{color: 'white'}} />
        </TouchableOpacity>
        <View style={{width: '76%'}}>
          <Text style={{color: 'white', fontSize: 24, textAlign: 'right'}}>
            {this.props.pageName}
          </Text>
        </View>
      </View>
    );
  }
}
export {HeadBar};

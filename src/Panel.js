import React, {Component} from 'react';
import {Text, View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {Icon} from 'native-base';
import Modal from 'react-native-modal';

class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
 
  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          alignItems: 'flex-end',
          // elevation: 12,
          // zIndex: 100,
        }}>
        <View
          style={{
            flexDirection: 'row-reverse',
            width: '100%',
            height: 100,
            alignItems: 'center',
            marginBottom: '2%',
            backgroundColor: '#00BCD4',
          }}>
          <Image
            style={{width: 80, height: 80}}
            source={require('./../assets/img/logo3.png')}
          />
          <Text style={{fontSize: 24, marginRight: '4%', color: 'white'}}>
            دست یار
          </Text>
        </View>
        <View style={{width: '100%'}}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Home')}
            style={[
              styles.MenuItem,
              this.props.activeItemKey == 'Home'
                ? styles.activeBackgroundColor
                : null,
            ]}>
            <Text
              style={[
                {marginRight: '6%', fontSize: 14},
                this.props.activeItemKey == 'Home'
                  ? styles.activeTextColor
                  : null,
              ]}>
              داشبورد
            </Text>
            <Icon
              type="FontAwesome5"
              name="home"
              fontSize={20}
              style={{marginRight: '4%', color: '#424242'}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.MenuItem,
              this.props.activeItemKey == 'Task'
                ? styles.activeBackgroundColor
                : null,
            ]}
            onPress={() => this.props.navigation.navigate('Task')}>
            <Text
              style={[
                {marginRight: '6%', fontSize: 14},
                this.props.activeItemKey == 'Task'
                  ? styles.activeTextColor
                  : null,
              ]}>
              فعالیت ها
            </Text>
            <Icon
              type="FontAwesome5"
              name="tasks"
              fontSize={20}
              style={{marginRight: '5%', color: '#424242'}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.MenuItem,
              this.props.activeItemKey == 'Archive'
                ? styles.activeBackgroundColor
                : null,
            ]}
            onPress={() => this.props.navigation.navigate('Archive')}>
            <Text
              style={[
                {marginRight: '6%', fontSize: 14},
                this.props.activeItemKey == 'Archive'
                  ? styles.activeTextColor
                  : null,
              ]}>
              بایگانی
            </Text>
            <Icon
              type="FontAwesome5"
              name="archive"
              fontSize={20}
              style={{marginRight: '5%', color: '#424242'}}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MenuItem: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // borderWidth: 1,
    borderRadius: 6,
    marginRight: '2%',
    marginLeft: '2%',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: '2%',
    shadowColor: '#fff',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 2,
  },
  activeBackgroundColor: {
    backgroundColor: '#4DD0E1',
  },
  activeTextColor: {
    color: 'white',
    fontSize: 18,
  },
});
export {Panel};

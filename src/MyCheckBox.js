import React, {Component} from 'react';
import {Icon, Row, ListItem, CheckBox, Body} from 'native-base';
import {View, Image, Text, TouchableOpacity} from 'react-native';

class MyCheckBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      data: this.props.data,
      checkedItem: this.props.checkedItem,
    };
  }
  componentDidMount() {
    if (this.state.checkedItem.indexOf(this.state.data) !== -1) {
      this.setState({checked: true});
    }
  }

  selectcheck = () => {
    checked = this.state.checked;
    data = this.props.data;
    this.setState({checked: !this.state.checked});
    this.props.onChecked(data, checked);
  };

  render() {
    return (
      <ListItem style={{height:50}}>
        <CheckBox
          checked={this.state.checked}
          onPress={this.selectcheck}
          color="#00bcd4"
        />
        <Body style={{marginLeft: 10}}>
          <Text onPress={this.selectcheck}>{this.props.data}</Text>
        </Body>
      </ListItem>
    );
  }
}
export {MyCheckBox};

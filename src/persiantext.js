import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';

class PersianNumber extends Component {
  constructor(props){
    super(props)
    this.state={}
  }
  static propTypes = {
    arabic: PropTypes.bool,
    latin: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.string,
    ]),
    format: PropTypes.bool,
    removeCommas: PropTypes.bool,
  };

  static defaultProps = {
    latin: true,
    arabic: false,
    format: false,
    removeCommas: false,
  };

  convert(string) {
    let result;
    const { arabic, latin, format, removeCommas  } = this.props;

    if (latin) {
      result = latinToPersian(string);
    }

    if (arabic) {
      result = arabicToPersian(result);
    }
   
    if (removeCommas) {
      result = removeCommasFromString(result);
    }
    
    if (format) {
      result = formatString(result);
    }

    return result;
  }

  render() {
    let { children } = this.props;

    if (!(children instanceof Array)) {
      children = [children];
    }

    return (<Text style={this.props.style}>
            {
              children.map(child => {
                if (typeof child === 'string') {
                  return this.convert(child);
                } else if (typeof child === 'number') {
                  return this.convert(child.toString());
                }
                return child;
              })
            }
        </Text>);
  }
}

export default PersianNumber;


const latinToPersianMap = ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'];
const latinNumbers = [/1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g, /0/g];
const arabicToPersianMap = ['۴', '۵', '۶'];
const arabicNumbers = [/٤/g, /٥/g, /٦/g];

export function latinToPersian(string) {
  let result = string;

  for (let index = 0; index < 10; index++) {
    result = result.replace(latinNumbers[index], latinToPersianMap[index]);
  }

  return result;
}

export function arabicToPersian(string) {
  let result = string;

  for (let index = 0; index < 10; index++) {
    result = result.replace(arabicNumbers[index], arabicToPersianMap[index]);
  }

  return result;
}

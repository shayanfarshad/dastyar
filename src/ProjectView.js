import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import Icon from 'react-native-vector-icons';
import SQLite from 'react-native-sqlite-storage';
import {updateExpression} from '@babel/types';

class ProjectView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      StartLeft: Math.floor(this.props.projectStartLeft / 24),
      EndLeft: Math.floor(this.props.projectEndLeft / 24),
      progress: 0,
      min: 0,
    };
  }
  // updateProgress = (progress, id) => {
  //   const  newData = [...this.state.DATA];
  //   newData[id-1].projectProgress = progress;
  //   this.setState({ DATA : newData });
  //   console.log(this.state.DATA)
  // }
  componentDidMount() {}

  returnProgress(projectProgress, projectId) {
    let {updateProgress} = this.props;
    updateProgress(projectProgress, projectId);
  }
  displayTime = () => {
    if (this.props.projectStartLeft > 0) {
      if (this.props.projectStartLeft > 24) {
        return (
          <Text style={{color: '#FFA000', textAlign: 'center'}}>
            {this.state.StartLeft} روز تا شروع پروژه
          </Text>
        );
      } else {
        return (
          <Text style={{color: '#FFA000', textAlign: 'center'}}>
            {this.props.projectStartLeft} ساعت تا شروع پروژه
          </Text>
        );
      }
    } else {
      if (this.props.projectEndLeft > 0) {
        if (this.props.projectEndLeft > 24) {
          return (
            <Text style={{color: '#1e7807', textAlign: 'center'}}>
              {this.state.EndLeft} روز تا پایان پروژه مانده
            </Text>
          );
        } else {
          return (
            <Text style={{color: '#a3081d', textAlign: 'center'}}>
              {this.props.projectEndLeft} ساعت تا پایان پروژه مانده
            </Text>
          );
        }
      } else {
        return (
          <Text style={{color: '#4a4646', textAlign: 'center'}}>
            زمان پروژه به پایان رسید
          </Text>
        );
      }
    }
  };

  render() {
    const {navigate} = this.props.navigation;
    return (
      <View
        style={{
          width: '50%',
          flexDirection: 'row-reverse',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigate('projectDetail', {
              projectId: this.props.projectId,
              projectEndLeft: this.props.projectEndLeft,
              projectStartLeft: this.props.projectStartLeft,
              startLeft: this.state.StartLeft,
              EndLeft: this.state.EndLeft,
              projectProgress: this.props.projectProgress,
              projectName: this.props.projectName,
              returnProgress: this.returnProgress.bind(this),
              taskLength: this.props.projectTaskLength,
            })
          }
          onLongPress={()=> this.props.deleteItem(this.props.item.projectId)}
        >
          <AnimatedCircularProgress
            size={120}
            width={3}
            fill={this.props.projectProgress}
            rotation={0}
            tintColor="#26C6DA"
            ref={ref => (this.circularProgress = ref)}
            duration={1000}
            backgroundColor="#FAFAFA">
            {fill => (
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontSize: 30, color: '#26C6DA'}}>
                  {Math.round(fill)}
                </Text>
                <Text style={{fontSize: 25, color: '#26C6DA'}}>%</Text>
              </View>
            )}
          </AnimatedCircularProgress>

          <Text style={{fontSize: 20, color: '#00BCD4'}}>
            {this.props.projectName}
          </Text>
          <View>{this.displayTime()}</View>
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    backgroundColor: 'white',

    flex: 1,
    justifyContent: 'center',
    borderRadius: 6,
    height: 200,
    alignItems: 'center',
    margin: '2%',
  },
});

export {ProjectView};

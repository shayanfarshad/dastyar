import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
// import {AnimatedCircularProgress} from 'react-native-circular-progress';
import LottieView from 'lottie-react-native';
import {Icon} from 'native-base';
import Modal from 'react-native-modal';
class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      day: Math.floor(this.props.taskLeft / 24),
      checked: false,
      done: this.props.taskDone,
      // progress : this.props.projectProgress,
      ModalVisible: false,
      tasklength: this.props.number,
      startLeft: Math.floor(this.props.taskStartLeft / 24),
      endLeft: Math.floor(this.props.taskEndLeft / 24),
    };
  }
  componentDidMount() {
    if (this.props.taskDone == 1) {
      this.animation.play();
    } else {
      this.animation.reset();
    }
  }
  displayTime = () => {
    if (this.props.taskStartLeft > 0) {
      if (this.props.taskStartLeft > 24) {
        return (
          <View style={{flex: 0.3, justifyContent: 'center'}}>
            <Text style={{color: '#FFA000', textAlign: 'center', fontSize: 12}}>
              {this.state.startLeft} روز تا شروع فعالیت
            </Text>
          </View>
        );
      } else {
        return (
          <View style={{flex: 0.3, justifyContent: 'center'}}>
            <Text style={{color: '#FFA000', textAlign: 'center', fontSize: 12}}>
              {this.props.taskStartLeft} ساعت تا شروع فعالیت
            </Text>
          </View>
        );
      }
    } else {
      if (this.props.taskEndLeft > 0) {
        if (this.props.taskEndLeft > 24) {
          return (
            <View style={{flex: 0.3, justifyContent: 'center'}}>
              <Text
                style={{color: '#1e7807', textAlign: 'center', fontSize: 12}}>
                {this.state.endLeft} روز تا پایان فعالیت مانده
              </Text>
            </View>
          );
        } else {
          return (
            <View style={{flex: 0.3, justifyContent: 'center'}}>
              <Text
                style={{color: '#a3081d', textAlign: 'center', fontSize: 12}}>
                {this.props.taskEndLeft} ساعت تا پایان فعالیت مانده
              </Text>
            </View>
          );
        }
      } else {
        return (
          <View style={{flex: 0.3, justifyContent: 'center'}}>
            <Text style={{color: '#4a4646', textAlign: 'center', fontSize: 12}}>
              زمان فعالیت به پایان رسید
            </Text>
          </View>
        );
      }
    }
  };
  toggleModal = () => {
    this.setState({ModalVisible: !this.state.ModalVisible});
  };
  checked = () => {
    const {done} = this.state;
    let {counter, taskId} = this.props;
    counter(taskId, done);
    // {console.log(this.state.progress)}

    if (this.state.done == 1) {
      this.setState({done: 0});
      this.animation.reset();
    } else {
      
      this.animation.play();
      this.setState({done: 1});
    }
    console.log('done', done);

  };

  render() {
    // console.log(this.state.progress)

    return (
      <View style={{flex: 1}}>
        <TouchableOpacity style={styles.taskTouch} onPress={this.toggleModal}>
          <View
            style={{
              flex: 0.3,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity
              style={{
                width: 38,
                // borderWidth: 1,
                height: 38,
                borderRadius: 19,
                shadowColor: '#fff',
                shadowOffset: {
                  width: 1,
                  height: 1,
                },
                shadowOpacity: 0.25,
                shadowRadius: 35,
                elevation: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={this.checked}>
              <LottieView
                ref={animation => {
                  this.animation = animation;
                }}
                source={require('../assets/animation/checkmarked2.json')}
                style={{width: 50}}
                loop={false}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 38,
                // borderWidth: 1,
                height: 38,
                borderRadius: 25,
                shadowColor: '#fff',
                shadowOffset: {
                  width: 1,
                  height: 1,
                },
                // marginLeft: 20,
                shadowOpacity: 0.25,
                shadowRadius: 35,
                elevation: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>
                this.props.deleteItem(this.props.item.taskId, this.state.done)
              }>
              <Icon
                name="trash"
                type="FontAwesome5"
                style={{color: '#880E4F', fontSize: 18}}
              />
            </TouchableOpacity>
          </View>
          {this.displayTime()}
          <View
            style={{
              flex: 0.4,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}>
            <Text
              style={{textAlign: 'right', paddingRight: '5%', fontSize: 12}}>
              {this.props.taskName}
            </Text>
          </View>
        </TouchableOpacity>
        <Modal
          isVisible={this.state.ModalVisible}
          animationIn="slideInLeft"
          onBackButtonPress={this.toggleModal}
          onBackdropPress={this.toggleModal}
          animationOut="slideOutRight">
          <View style={styles.desModal}>
            {this.state.done == 1 ? (
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: '#126b0d',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  elevation: 2,
                }}>
                <Icon
                  type="FontAwesome5"
                  name="check"
                  style={{color: 'white', fontSize: 30}}
                />
              </View>
            ) : null}
            <ScrollView>
              <View>
                <Text style={styles.modalTitle}>نام فعالیت</Text>
              </View>

              <View style={{justifyContent: 'center', marginRight: '10%'}}>
                <Text
                  style={{
                    fontSize: 14,
                    textAlign: 'right',
                    fontFamily: 'IRANSansMobile_Light',
                  }}>
                  {this.props.taskName}
                </Text>
              </View>
              <View>
                <Text style={styles.modalTitle}>توضیحات </Text>
              </View>

              <View
                style={{justifyContent: 'flex-end', paddingHorizontal: '10%'}}>
                <Text
                  style={{
                    fontSize: 14,
                    textAlign: 'right',
                    fontFamily: 'IRANSansMobile_Light',
                  }}>
                  {this.props.taskDes}
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: '#880E4F',
    borderRadius: 4,
    color: 'white',
    // marginRight: '5%',
    margin: '2%',
    padding: '2%',
  },
  taskTouch: {
    flex: 1,
    height: 120,
    backgroundColor: 'red',
    flexDirection: 'row',
    borderRadius: 5,
    // borderWidth: 1,
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 3,
    backgroundColor: 'white',
    paddingRight: '1%',
    paddingLeft: '1%',
  },
  desModal: {
    backgroundColor: 'white',
    // borderWidth: 15,
    borderColor: '#880E4F',
    borderRadius: 15,
    width: '76%',
    height: 300,
    marginLeft: '12%',
    padding: '2%',
    justifyContent: 'center',
    // alignItems: 'center',
  },
});
export {TaskList};

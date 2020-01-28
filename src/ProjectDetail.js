import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
  BackHandler,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import {Icon, Fab} from 'native-base';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {TaskList} from './TaskList';
import SQLite from 'react-native-sqlite-storage';
import PushNotification from 'react-native-push-notification';
import Modal from 'react-native-modal';
let db = null;
class ProjectDetail extends Component {
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener(
      'didFocus',
      payload => BackHandler.addEventListener('hardwareBackPress', this.goback),
    );
    this.state = {
      projectId: this.props.navigation.state.params.projectId,
      projectStartLeft: this.props.navigation.state.params.projectStartLeft,
      projectEndLeft: this.props.navigation.state.params.projectEndLeft,
      StartLeft: this.props.navigation.state.params.startLeft,
      EndLeft: this.props.navigation.state.params.EndLeft,
      projectTaskLeft: this.props.navigation.state.params.projectTaskLeft,
      projectProgress: this.props.navigation.state.params.projectProgress,
      projectName: this.props.navigation.state.params.projectName,
      startDate: this.props.navigation.state.params.startDate,
      endDate: this.props.navigation.state.params.endDate,
      projectTaskLength: this.props.navigation.state.params.taskLength,
      task: [],
      done: 0,
      taskLength: 0,
      count: 0,
      cliked: false,
      flatlistrefresh: false,
      refresh: false,
      doneTask: 0,
      ModalVisible: false,
      visible: false,
    };
  }
  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload =>
        BackHandler.removeEventListener('hardwareBackPress', this.goback),
    );
    // BackHandler.addEventListener('hardwareBackPress', this.goback);
    db = SQLite.openDatabase(
      {
        name: 'myDb.db',
        createFromLocation: '~database.db',
        location: 'Library',
      },
      this.openCB,
      this.errorCB,
    );
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM projectTable WHERE projectId=${this.state.projectId}`,
        [],
        (tx, results) => {
          console.log('Query completed');
          var len = results.rows.length;
          for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);
            projectTaskLeft = row.projectTaskLeft;
            projectTaskLength = row.projectTaskLength;
            // console.log(DayLeft / 3600000);
          }
          this.setState({
            projectTaskLeft: projectTaskLeft,
            projectTaskLength: projectTaskLength,
          });
        },
      );
      tx.executeSql(
        `SELECT * FROM taskTable WHERE projectId=${this.state.projectId}`,
        [],
        (tx, results) => {
          console.log('Query completed');
          var temp = [];
          var len = results.rows.length;

          var date = new Date();
          for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);

            row.taskStartLeft = Math.floor(
              (new Date(row.taskStartTime) - date) / 3600000,
            );
            row.taskEndLeft = Math.floor(
              (new Date(row.taskEndTime) - date) / 3600000,
            );
            // console.log(DayLeft / 3600000);
            temp.push(row);
          }
          this.setState({
            task: temp,
            taskLength: len,
          });
          console.log(this.state.task);
        },
      );
      tx.executeSql(
        `SELECT * FROM taskTable WHERE projectId=${this.state.projectId} AND taskDone=1`,
        [],
        (tx, results) => {
          console.log('Query completed');
          var num = results.rows.length;

          this.setState({doneTask: num});

          const progress = (this.state.doneTask / this.state.taskLength) * 100;
          if (isNaN(progress)) {
            this.setState({projectProgress: 0});
          } else {
            this.setState({projectProgress: progress});
          }
        },
      );
    });
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
    // BackHandler.removeEventListener('hardwareBackPress', this.goback);
  }
  errorCB(err) {
    console.log('SQL Error: ' + err);
  }

  successCB() {
    console.log('SQL executed fine');
  }

  openCB() {
    console.log('Database OPENED');
  }
  displayTime = () => {
    if (this.state.projectStartLeft > 0) {
      if (this.state.projectStartLeft > 24) {
        return (
          <Text style={{color: '#FFA000', textAlign: 'center'}}>
            {this.state.StartLeft} روز تا شروع پروژه
          </Text>
        );
      } else {
        return (
          <Text style={{color: '#FFA000', textAlign: 'center'}}>
            {this.state.projectStartLeft} ساعت تا شروع پروژه
          </Text>
        );
      }
    } else {
      if (this.state.projectEndLeft > 0) {
        if (this.state.projectEndLeft > 24) {
          return (
            <Text style={{color: '#1e7807', textAlign: 'center'}}>
              {this.state.EndLeft} روز تا پایان پروژه مانده
            </Text>
          );
        } else {
          return (
            <Text style={{color: '#a3081d', textAlign: 'center'}}>
              {this.state.projectEndLeft} ساعت تا پایان پروژه مانده
            </Text>
          );
        }
      } else {
        return (
          <Text style={{color: '#4a4646', textAlign: 'center'}}>
            زمان فعالیت به پایان رسید
          </Text>
        );
      }
    }
  };
  taskCounter = (taskId, done) => {
    // let progress = this.state.projectProgress;
    let addProgress = (1 / this.state.taskLength) * 100;
    if (done == 1) {
      this.setState({
        count: this.state.count - 1,
        projectProgress: this.state.projectProgress - addProgress,
        projectTaskLeft: this.state.projectTaskLeft + 1,
        doneTask: this.state.doneTask - 1,
      });
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE taskTable set taskDone=0 WHERE taskId=${taskId}`,
          [],
        ),
          tx.executeSql(
            `UPDATE projectTable set projectTaskLeft=${this.state.projectTaskLeft} WHERE projectId=${this.state.projectId}`,
            [],
          ),
          tx.executeSql(
            `UPDATE taskTable set taskProgress=0 WHERE taskId=${taskId}`,
            [],
          ),
          console.log('deleted');
      });
    } else {
      this.setState({
        count: this.state.count + 1,
        projectProgress: this.state.projectProgress + addProgress,
        projectTaskLeft: this.state.projectTaskLeft - 1,
        doneTask: this.state.doneTask + 1,
      });
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE taskTable set taskDone=1 WHERE taskId=${taskId}`,
          [],
        ),
          tx.executeSql(
            `UPDATE projectTable set projectTaskLeft=${this.state.projectTaskLeft} WHERE projectId=${this.state.projectId}`,
            [],
          ),
          tx.executeSql(
            `UPDATE taskTable set taskProgress=100 WHERE taskId=${taskId}`,
            [],
          ),
          console.log('upadated');
      });
    }
  };
  hideToast = () => {
    this.setState({
      visible: false,
    });
  };

  callback(task) {
    this.setState({visible: true}, () => {
      this.hideToast();
    });
    let temp = this.state.task;
    temp.push(task);
    this.setState({task: temp, flatlistrefresh: true});
    let updateProgress =
      (100 / (this.state.taskLength + 1)) * this.state.doneTask;
    // let taskLeft = this.state.projectTaskLeft + 1;

    this.setState({
      projectTaskLength: this.state.taskLength + 1,
      projectTaskLeft: this.state.projectTaskLeft + 1,
      taskLength: this.state.taskLength + 1,
      projectProgress: updateProgress,
    });
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM projectTable WHERE projectId=${this.state.projectId}`,
        [],
        (tx, results) => {
          // console.log('Query completed');
          tx.executeSql(
            `UPDATE projectTable set projectTaskLength=${this.state.projectTaskLength} WHERE projectId=${this.state.projectId}`,
            [],
          ),
            tx.executeSql(
              `UPDATE projectTable set projectTaskLeft=${this.state.projectTaskLeft} WHERE projectId=${this.state.projectId}`,
              [],
            ),
            console.log('upadated');
        },
      );
    });
  }
  pressMain = () => {
    this.setState({flatlistrefresh: false, projectProgress: 0});
    this.props.navigation.navigate('createTask', {
      projectId: this.state.projectId,
      callback: this.callback.bind(this),
    });
  };

  goback = () => {
    const projectId = this.state.projectId;
    const projectProgress = this.state.projectProgress;

    this.props.navigation.state.params.returnProgress(
      projectProgress,
      projectId,
    );
    this.props.navigation.goBack();
    return true;
  };
  toggleModal = () => {
    this.setState({ModalVisible: !this.state.ModalVisible});
  };
  removeItemRender = (taskId, done) => {
    this.setState({
      ModalVisible: !this.state.ModalVisible,
      newID: taskId,
      done: done,
    });
    this.renderModalContent(taskId, done);
  };
  renderModalContent = () => {
    const {newID, done} = this.state;

    return (
      <View style={styles.deleteModal}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: '12%',
          }}>
          <Text style={{textAlign: 'right'}}>
            آیا مطمئن هستید می خواهید رویداد را پاک کنید؟
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={styles.deleteTouch}
            onPress={() => this.removeItem(newID, done)}>
            <Text style={{color: 'white', textAlign: 'center'}}>بله</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelTouch}
            onPress={this.toggleModal}>
            <Text style={{color: 'white', textAlign: 'center'}}>خیر</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  removeItem = (taskId, done) => {
    console.log(done, this.state.taskLength, this.state.doneTask);
    const {task} = this.state;

    if (this.state.taskLength - 1 == 0) {
      this.setState({
        projectProgress: 0,
        task: task.slice().filter(item => item.taskId !== taskId),
        ModalVisible: !this.state.ModalVisible,
        projectTaskLeft: 0,
        projectTaskLength: 0,
        taskLength: 0,
        doneTask: 0,
      });
    } else {
      if (done == 1) {
        this.setState({
          task: task.slice().filter(item => item.taskId !== taskId),
          ModalVisible: !this.state.ModalVisible,
          projectTaskLength: this.state.taskLength - 1,
          // projectTaskLeft: this.state.projectTaskLeft - 1,
          taskLength: this.state.taskLength - 1,
          projectProgress:
            ((this.state.doneTask - 1) / (this.state.taskLength - 1)) * 100,
          doneTask: this.state.doneTask - 1,
        });
      } else {
        this.setState({
          task: task.slice().filter(item => item.taskId !== taskId),
          ModalVisible: !this.state.ModalVisible,
          projectTaskLength: this.state.taskLength - 1,
          projectTaskLeft: this.state.projectTaskLeft - 1,
          taskLength: this.state.taskLength - 1,
          projectProgress:
            (this.state.doneTask / (this.state.taskLength - 1)) * 100,
        });
      }
    }

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM taskTable WHERE projectId=${this.state.projectId}`,
        [],
        (tx, results) => {
          tx.executeSql(`DELETE FROM taskTable WHERE taskId=${taskId}`, []);
        },
      ),
        tx.executeSql(
          `SELECT * FROM projectTable WHERE projectId=${this.state.projectId}`,
          [],
          (tx, results) => {
            tx.executeSql(
              `UPDATE projectTable set projectTaskLeft=${this.state.projectTaskLeft} WHERE projectId=${this.state.projectId} `,
            );
            tx.executeSql(
              `UPDATE projectTable set projectTaskLength=${this.state.projectTaskLength} WHERE projectId=${this.state.projectId} `,
            );
            console.log('DELETED');
          },
        );
    });
    console.log(done, this.state.taskLength, this.state.doneTask);
  };

 

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
        <StatusBar backgroundColor="#780c45" barStyle="light-content" />
        <Toast visible={this.state.visible} message="فعالیت جدید ساخته شد" />
        <View
          style={{
            height: 60,
            flexDirection: 'row',
            backgroundColor: '#880E4F',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={this.goback}
            style={{
              width: '10%',
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: '5%',
            }}>
            <Icon
              name="arrow-back"
              type="Ionicons"
              style={{fontSize: 30, color: 'white'}}
            />
          </TouchableOpacity>
          <Text style={{color: 'white', fontSize: 20, marginRight: '5%'}}>
            {this.state.projectName}
          </Text>
        </View>
        <View style={styles.project_view}>
          <View
            style={{
              // borderWidth:1,
              width: '15%',
              marginLeft: '2%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{color: '#616161', fontSize: 20}}>
              {this.state.projectTaskLeft}
            </Text>
            <Text style={{color: '#616161', fontSize: 14, textAlign: 'center'}}>
              فعالیت مانده
            </Text>
          </View>
          <View
            style={{
              width: '27%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AnimatedCircularProgress
              size={100}
              width={3}
              fill={this.state.projectProgress}
              rotation={0}
              tintColor="#880E4F"
              ref={ref => (this.circularProgress = ref)}
              duration={1000}
              backgroundColor="#FAFAFA">
              {fill => (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontSize: 30, color: '#880E4F'}}>
                    {Math.round(fill)}
                  </Text>
                  <Text style={{fontSize: 25, color: '#880E4F'}}>%</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '2%',
              width: '40%',
              // borderWidth:1
            }}>
            {this.displayTime()}
          </View>
        </View>
        <FlatList
          data={this.state.task}
          extraData={this.state.flatlistrefresh}
          ListEmptyComponent={() => {
            return (
              <View style={{width: '100%', marginTop: '40%'}}>
                <Text
                  style={{color: '#bbbec4', fontSize: 18, textAlign: 'center'}}>
                  فعالیت جدید ایجاد کنید
                </Text>
              </View>
            );
          }}
          keyExtractor={(item, index) => item.taskId}
          renderItem={({item, index}) => (
            <TaskList
              id={index + 1}
              item={item}
              deleteItem={this.removeItemRender}
              taskId={item.taskId}
              taskName={item.taskName}
              taskDes={item.taskDes}
              taskDone={item.taskDone}
              taskStartLeft={item.taskStartLeft}
              taskEndLeft={item.taskEndLeft}
              number={this.state.taskLength}
              count={this.state.count}
              counter={this.taskCounter}
              callback={this.progressCallBack}
            />
          )}
        />
        <Modal
          isVisible={this.state.ModalVisible}
          animationIn="slideInLeft"
          onBackButtonPress={this.toggleModal}
          onBackdropPress={this.toggleModal}
          animationOut="slideOutRight">
          {this.renderModalContent()}
        </Modal>
        <Fab
          containerStyle={{marginLeft: '4%', marginBottom: '4%'}}
          style={{backgroundColor: '#880E4F'}}
          position="bottomLeft"
          onPress={this.pressMain}>
          <Icon name="plus" type="FontAwesome5" style={{fontSize: 16}} />
        </Fab>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  project_view: {
    height: 180,
    flexDirection: 'row',
    borderRadius: 5,
    // borderWidth: 1,
    margin: '2%',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    backgroundColor: 'white',
  },
  deleteModal: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: '76%',
    height: 120,
    marginLeft: '12%',
    justifyContent: 'center',
    // paddingTop: 10,
  },
  deleteTouch: {
    width: 80,
    height: 40,
    alignSelf: 'center',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#880E4F',
    shadowColor: '#000',
    borderRadius: 5,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  cancelTouch: {
    width: 80,
    height: 40,
    alignSelf: 'center',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#880E4F',
    shadowColor: '#000',
    borderRadius: 5,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});
const Toast = props => {
  if (props.visible) {
    ToastAndroid.showWithGravityAndOffset(
      props.message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
    return null;
  }
  return null;
};
export {ProjectDetail};

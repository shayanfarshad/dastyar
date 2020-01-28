import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  BackHandler,
  StatusBar
} from 'react-native';
import {Dropdown} from 'react-native-material-dropdown';
// import SwitchToggle from 'react-native-switch-toggle';
// import NotifService from './NotifService';
import PersianCalendarPicker from 'react-native-persian-calendar-picker';
import moment from 'moment-jalaali';
import Modal from 'react-native-modal';
import SQLite from 'react-native-sqlite-storage';
import PersianNumber from './persiantext';
import PushNotification from 'react-native-push-notification';
let db = null;
import {Icon} from 'native-base';
// let db = null;
class CreateTaskScreen extends Component {
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener(
      'didFocus',
      payload =>
        BackHandler.addEventListener('hardwareBackPress', this.toggleGoBack),
    );
    this.onChangeText = this.onChangeText.bind(this);
    this.taskTypeRef = this.updateRef.bind(this, 'taskType');
    this.onDateChange = this.onDateChange.bind(this);
    this.state = {
      isModalVisible: false,
      types: [
        {value: 'sprint 1'},
        {value: 'sprint 2'},
        {value: 'sprint 3'},
        {value: 'sprint 4'},
        {value: 'sprint 5'},
        {value: 'sprint 6'},
        {value: 'sprint 7'},
        {value: 'sprint 8'},
        {value: 'sprint 9'},
        {value: 'sprint 10'},
        {value: 'sprint 11'},
        {value: 'sprint 12'},
        {value: 'sprint 13'},
        {value: 'sprint 14'},
        {value: 'sprint 15'},
        {value: 'sprint 16'},
        {value: 'sprint 17'},
        {value: 'sprint 18'},
        {value: 'sprint 19'},
        {value: 'sprint 20'},
      ],
      projectId: this.props.navigation.state.params.projectId,
      myDate: ['', ''],
      taskName: '',
      taskType: '',
      taskDes: '',
      taskStartDate: '',
      taskEndDate: '',
      taskStartTime: '',
      taskEndTime: '',
      taskProgress: 0,
      isoStartDate: null,
      isoEndDate: null,
      taskStartLeft: null,
      taskEndLeft: null,
      taskDone: 0,
      gobackModal: false,
      isStartClick: true,
    };
  }

  componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload =>
        BackHandler.removeEventListener('hardwareBackPress', this.toggleGoBack),
    );
    // BackHandler.addEventListener('hardwareBackPress', this.toggleGoBack);

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
        'CREATE TABLE IF NOT EXISTS taskTable(' +
          'taskId INTEGER PRIMARY KEY AUTOINCREMENT,' +
          'projectId INTEGER,' +
          'taskName VARCHAR(255),' +
          'taskType VARCHAR(255),' +
          'taskDes VARCHAR(255),' +
          'taskStartTime VARCHAR(255),' +
          'taskEndTime VARCHAR(255),' +
          'taskStartDate VARCHAR(255),' +
          'taskEndDate VARCHAR(255),' +
          'taskStartLeft INTEGER,' +
          'taskEndLeft INTEGER,' +
          'isoStartDate VARCHAR(255),' +
          'isoEndDate VARCHAR(255),' +
          'taskProgress INTEGER,' +
          'tasDone INTEGER )',
        [],
      );

      tx.executeSql(
        `SELECT isoStartDate, isoEndDate FROM projectTable WHERE projectId=${this.state.projectId} `,
        [],
        (tx, results) => {
          console.log('Query completed');
          var len = results.rows.length;

          for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);
            isoStartDate = row.isoStartDate;
            isoEndDate = row.isoEndDate;
          }
          this.setState({
            StartDate: isoStartDate,
            EndDate: isoEndDate,
          });
        },
      );
    });
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

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
    // BackHandler.removeEventListener('hardwareBackPress', this.toggleGoBack);
  }

  updateRef(taskType, ref) {
    this[taskType] = ref;
  }
  onChangeText(text) {
    ['taskType']
      .map(taskType => ({taskType, ref: this[taskType]}))
      .filter(({ref}) => ref && ref.isFocused())
      .forEach(({taskType, ref}) => {
        this.setState({[taskType]: text});
      });
  }
  onDateChange = date => {
    const jDate = moment(date).format('jYYYY/jM/jD');

    // dateDay = date._d.getDate();
    // dateMonth = date._d.getMonth() + 1;
    // dateYear = date._d.getFullYear();
    // this.setState({
    //   taskDayIso: dateMonth + '/' + dateDay + '/' + dateYear,
    //   taskDate: jDate,
    // });
    dateArr = this.state.myDate;
    if (this.state.isStartClick) {
      isoStart = date._d.toString();
      dateDay = date._d.getDate();
      dateMonth = date._d.getMonth() + 1;
      dateYear = date._d.getFullYear();
      this.setState({
        taskStartTime: dateMonth + '/' + dateDay + '/' + dateYear,
        isoStartDate: isoStart,
      });
      dateArr[0] = jDate;
      this.setState({myDate: dateArr, isStartClick: false});
    } else {
      isoEnd = date._d.toString();
      dateDay = date._d.getDate();
      dateMonth = date._d.getMonth() + 1;
      dateYear = date._d.getFullYear();
      this.setState({
        taskEndTime: dateMonth + '/' + dateDay + '/' + dateYear,
        isoEndDate: isoEnd,
      });
      dateArr[1] = jDate;
      this.setState({myDate: dateArr, isStartClick: true});
    }
  };
  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };
  handleBackRender = () => {
    return (
      <View style={styles.deleteModal}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: 30,
          }}>
          <Text>آیا مطمئن هستید بدون ذخیره سازی می خواهید خارج شوید ؟</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={styles.deleteTouch}
            onPress={() => this.props.navigation.goBack()}>
            <Text style={{color: 'white', textAlign: 'center'}}>بله</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelTouch}
            onPress={this.toggleGoBack}>
            <Text style={{color: 'white', textAlign: 'center'}}>خیر</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  toggleGoBack = () => {
    this.setState({gobackModal: !this.state.gobackModal});
    return true;
  };

  addTask = task => {
    const navigation = this.props.navigation;
    navigation.getParam('callback')(task);
    navigation.navigate('projectDetail');
  };

  notification = (taskName, taskStartLeft, taskEndLeft) => {
    PushNotification.localNotificationSchedule({
      date: new Date(Date.now() + (taskStartLeft + 8) * 3600000),
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_launcher',
      bigText: `فعالیتی به اسم ${taskName} پیش روی شماست ، فراموش نکنید`,
      subText: 'رویداد جدید پیش روی شماست',
      color: '#00bcd4',
      title: 'شروع رویداد جدید',
      message: 'فعالیت جدیدی پیش روی شماست ، انجام آن را فراموش نکنید ',
      playSound: true,
      soundName: 'default',
      vibrate: false,
    });
    PushNotification.localNotificationSchedule({
      date: new Date(Date.now() + (taskEndLeft + 8) * 3600000),
      autoCancel: true,
      largeIcon: 'ic_launcher_red',
      smallIcon: 'ic_launcher_red',
      bigText: `فعالیت ${taskName} در حال اتمام است روز پایانی را از دست ندهید`,
      subText: 'فعالیت شما رو به پایان است',
      color: '#880E4F',
      title: 'هشدار پایان فعالیت',
      message: 'فعالیت شما رو به پایان است ، رو پایانی را از دست ندهید ',
      playSound: true,
      soundName: 'default',
      vibrate: false,
    });
  };
  saveData = () => {
    const taskStartDate = this.state.myDate[0];
    const taskEndDate = this.state.myDate[1];

    const {
      taskId,
      projectId,
      taskStartTime,
      taskEndTime,
      taskStartLeft,
      taskEndLeft,
      isoStartDate,
      isoEndDate,
      taskName,
      taskType,
      taskDes,
      taskProgress,
      taskDone,
    } = this.state;
    if (
      taskType == '' ||
      taskStartDate == '' ||
      taskEndDate == '' ||
      taskName == ''
    ) {
      Alert.alert('فیلد ها را پر کنید');
    } else {
      let date = new Date();
      let task = new Object();
      task.taskName = taskName;
      task.taskStartTime = taskStartTime;
      task.taskEndTime = taskEndTime;
      task.taskStartDate = taskStartDate;
      task.taskEndDate = taskEndDate;
      task.isoStartDate = isoStartDate;
      task.isoEndDate = isoEndDate;
      (task.taskStartLeft = Math.floor(
        Math.abs((new Date(taskStartTime) - date) / 3600000),
      )),
        (task.taskEndLeft = Math.floor(
          Math.abs((new Date(taskEndTime) - date) / 3600000),
        )),
        (task.taskDes = taskDes);
      task.taskProgress = taskProgress;
      task.taskType = taskType;
      task.projectId = projectId;
      task.taskDone = taskDone;

      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO taskTable (taskId , projectId , taskName, taskType, taskDes, taskStartTime, taskEndTime,taskStartDate,taskEndDate ,taskStartLeft,taskEndLeft,isoStartDate,isoEndDate, taskProgress, taskDone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
          [
            taskId,
            projectId,
            taskName,
            taskType,
            taskDes,
            taskStartTime,
            taskEndTime,
            taskStartDate,
            taskEndDate,
            taskStartLeft,
            taskEndLeft,
            isoStartDate,
            isoEndDate,
            taskProgress,
            taskDone,
          ],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              tx.executeSql(
                'SELECT * FROM taskTable ORDER BY taskId DESC LIMIT 1',
                [],
                (tx, results) => {
                  console.log('Query completed');
                  var task = new Object();
                  var date = new Date();
                  var len = results.rows.length;

                  for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    row.taskStartLeft = Math.floor(
                      (new Date(row.taskStartTime) - date) / 3600000,
                    );
                    row.taskEndLeft = Math.floor(
                      (new Date(row.taskEndTime) - date) / 3600000,
                    );
                    task.taskId = row.taskId;
                    task.taskName = row.taskName;
                    task.taskStartTime = row.taskStartTime;
                    task.taskEndTime = row.taskEndTime;
                    task.taskStartDate = row.taskStartDate;
                    task.taskEndDate = row.taskEndDate;
                    task.isoStartDate = row.isoStartDate;
                    task.isoEndDate = row.isoEndDate;
                    task.taskStartLeft = Math.floor(
                      (new Date(row.taskStartTime) - date) / 3600000,
                    );
                    task.taskEndLeft = Math.floor(
                      (new Date(row.taskEndTime) - date) / 3600000,
                    );
                    task.taskDes = row.taskDes;
                    task.taskProgress = row.taskProgress;
                    task.taskType = row.taskType;
                    task.projectId = row.projectId;
                    task.taskDone = row.taskDone;
                  }

                  this.addTask(task);
                  this.notification(
                    task.taskName,
                    task.taskStartLeft,
                    task.taskEndLeft,
                  );
                },
              );
            }
          },
        );
      });
    }
  };

  static navigationOptions = {
    header: null,
  };
  render() {
    return (
      <ScrollView>
      <StatusBar backgroundColor="#780c45" barStyle="light-content" />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#880E4F',
            paddingLeft: '2%',
            paddingRight: '2%',
          }}>
          <Modal
            isVisible={this.state.gobackModal}
            animationIn="slideInLeft"
            // onBackButtonPress={this.toggleGoBack}
            onBackdropPress={this.toggleGoBack}
            animationOut="slideOutRight">
            {this.handleBackRender()}
          </Modal>
          <TouchableOpacity
            style={{marginTop: '3%', marginLeft: '3%'}}
            onPress={this.toggleGoBack}>
            <Icon
              name="arrow-back"
              type="Ionicons"
              style={{fontSize: 30, color: 'white'}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginTop: '3%', marginRight: '3%'}}
            onPress={this.saveData}>
            <Icon
              name="checkmark"
              type="Ionicons"
              style={{fontSize: 30, color: 'white'}}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 120,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#880E4F',
          }}>
          <Text
            style={{
              fontSize: 24,
              color: 'white',
              marginLeft: 110,
              marginBottom: 10,
            }}>
            نام فعالیت:
          </Text>
          <TextInput
            onChangeText={taskName => this.setState({taskName})}
            selectionColor="white"
            autoCompleteType="off"
            style={{
              color: 'white',
              fontSize: 18,
              fontFamily: 'IRANSansMobile_Medium',
              width: 180,
              borderBottomWidth: 2,
              borderBottomColor: 'white',
              marginLeft: 20,
              marginTop: -20,
              paddingBottom: -10,
            }}
          />
        </View>
        <View style={{flex: 1, marginTop: '5%'}}>
          <View style={styles.itemView}>
            <Dropdown
              ref={this.taskTypeRef}
              value={this.state.taskType}
              containerStyle={{width: 200}}
              onChangeText={this.onChangeText}
              label="گروه بندی"
              data={this.state.types}
            />
            <Icon
              name="layer-group"
              type="FontAwesome5"
              style={{color: '#D81B60', fontSize: 36}}
            />
          </View>
          <View style={styles.itemView}>
            <TextInput
              multiline={true}
              numberOfLines={5}
              selectionColor="#D81B60"
              textAlignVertical="top"
              style={{
                color: '#212121',
                fontSize: 14,
                fontFamily: 'IRANSansMobile_Medium',
                width: 200,
                borderWidth: 2,
                // borderBottomWidth: 2,
                borderColor: '#D81B60',
                marginTop: -20,
                paddingBottom: -10,
                // paddingRight: 5,
                marginRight: 10,
              }}
              onChangeText={taskDes => this.setState({taskDes})}
            />
            <View
              style={{
                width: 90,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                name="file-alt"
                type="FontAwesome5"
                style={{color: '#D81B60', fontSize: 36, marginLeft: -10}}
              />
              <Text style={{marginLeft: -45}}>توضیحات :</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              height: 100,
              // borderWidth: 1,
              alignItems: 'center',
            }}>
            <Modal
              isVisible={this.state.isModalVisible}
              animationIn="slideInLeft"
              animationOut="slideOutRight"
              onBackButtonPress={this.toggleModal}
              onBackdropPress={this.toggleModal}
              // style={{backgroundColor: 'white', borderWidth: 1 , borderRadius:15}}
            >
              <View
                style={{
                  justifyContent: 'center',
                  width: '90%',
                  height: 330,
                  backgroundColor: 'white',
                  marginLeft: '5%',
                  borderRadius: 10,
                }}>
                <PersianCalendarPicker
                  height={320}
                  minDate={new Date(this.state.StartDate)}
                  maxDate={new Date(this.state.EndDate)}
                  onDateChange={this.onDateChange}
                  todayBackgroundColor="#ffa000"
                  selectedDayColor="#D81B60"
                  initialDate={new Date()}
                  isRTL={true}
                  selectedRangeStartStyle={{
                    borderBottomRightRadius: 20,
                    borderTopRightRadius: 20,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  selectedRangeEndStyle={{
                    borderBottomRightRadius: 0,
                    borderTopRightRadius: 0,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                  }}
                  todayBackgroundColor="#ffa000"
                  selectedDayColor="#880E4F"
                  allowRangeSelection={true}
                />
                <TouchableOpacity
                  style={{width: 50, height: 40 , borderRadius:5 , backgroundColor:'#880E4F', marginLeft:20, justifyContent:'center'}}
                  onPress={this.toggleModal}>
                  <Text style={{color:'white', textAlign:'center'}}>تایید</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            <TouchableOpacity
              style={{marginLeft: '6%', flexDirection: 'row'}}
              onPress={this.toggleModal}>
              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 2,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,

                  elevation: 5,
                  backgroundColor: 'white',
                  flexDirection: 'row',
                  width: 160,
                  borderRadius: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '2%',
                }}>
                <PersianNumber>
                  {this.state.myDate[1] + ' - ' + this.state.myDate[0]}
                </PersianNumber>
              </View>
              <View>
                <Text style={{paddingRight: 10}}>تاریخ :</Text>
                <Text
                  style={{fontSize: 10, color: '#757575', paddingRight: 10}}>
                  تاریخ فعالیت
                </Text>
              </View>
              <Icon
                name="calendar-day"
                type="FontAwesome5"
                style={{color: '#D81B60', fontSize: 36}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  itemView: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 100,
    marginLeft: 60,
    // borderWidth: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  itemcolumn: {
    justifyContent: 'center',
    height: 100,
    // borderWidth: 1,
    alignItems: 'center',
    marginLeft: '4%',
  },
  button: {
    borderWidth: 1,
    borderColor: '#000000',
    margin: 5,
    padding: 5,
    width: '70%',
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
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

export {CreateTaskScreen};

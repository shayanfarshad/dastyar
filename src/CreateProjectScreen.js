import React, {Component} from 'react';
import {Icon} from 'native-base';
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import {Dropdown} from 'react-native-material-dropdown';
import SwitchToggle from 'react-native-switch-toggle';
import NotifService from './NotifService';
import PersianCalendarPicker from 'react-native-persian-calendar-picker';
import moment from 'moment-jalaali';
import Modal from 'react-native-modal';
import SQLite from 'react-native-sqlite-storage';
import PersianNumber from './persiantext';
import PushNotification from 'react-native-push-notification';

let db = null;
class CreateProjectScreen extends Component {
  constructor(props) {
    super(props);
    this.onDateChange = this.onDateChange.bind(this);
    this.notif = new NotifService(
      this.onRegister.bind(this),
      this.onNotif.bind(this),
    );

    this.state = {
      switchOn: true,
      myDate: ['', ''],

      isStartClick: true,
      isEndClick: false,
      isModalVisible: false,
      count: false,
      projectName: '',
      projectDes: '',
      projectaActivate: true,
      projectStartDate: '',
      projectEndDate: '',
      projectProgress: 0,
      projectStartTime: null,
      projectEndTime: null,
      projectStartLeft: null,
      projectEndLeft: null,
      projectTaskLeft: 0,
      projectTaskLength: 0,
      isoStartDate: null,
      isoEndDate: null,
      gobackModal: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.toggleGoBack);
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
        'CREATE TABLE IF NOT EXISTS projectTable(' +
          'projectId  INTEGER PRIMARY KEY AUTOINCREMENT,' +
          'projectName VARCHAR(255),' +
          'projectDes VARCHAR(255),' +
          'projectActivate VARCHAR(255),' +
          'projectStartDate VARCHAR(255),' +
          'projectEndDate VARCHAR(255),' +
          'projectProgress INTEGER,' +
          'projectStartTime VARCHAR,' +
          'projectEndTime VARCHAR,' +
          'projectStartLeft INTEGER,' +
          'projectEndLeft INTEGER,' +
          'projectTaskLeft INTEGER,' +
          'projectTaskLength INTEGER,' +
          'isoStartDate VARCHAR,' +
          'isoEndDate VARCHAR)',
        [],
      );
      console.log('table created');
    });
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.toggleGoBack);
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
  onRegister(token) {
    this.setState({registerToken: token.token, gcmRegistered: true});
  }

  onNotif(notif) {
    console.log(notif);
  }
  onDateChange = date => {
    const jDate = moment(date).format('jYYYY/jM/jD');

    dateArr = this.state.myDate;
    if (this.state.isStartClick) {
      isoStart = date._d.toString();
      dateDay = date._d.getDate();
      dateMonth = date._d.getMonth() + 1;
      dateYear = date._d.getFullYear();
      this.setState({
        projectStartTime: dateMonth + '/' + dateDay + '/' + dateYear,
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
        projectEndTime: dateMonth + '/' + dateDay + '/' + dateYear,
        isoEndDate: isoEnd,
      });
      dateArr[1] = jDate;
      this.setState({myDate: dateArr, isStartClick: true});
    }
  };
  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };

  static navigationOptions = {
    header: null,
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
  AddProject = projects => {
    const navigation = this.props.navigation;
    navigation.getParam('callback')(projects);
    navigation.navigate('Home');
  };

  saveData = () => {
    const projectStartDate = this.state.myDate[0];
    const projectEndDate = this.state.myDate[1];
    const projectActivate = this.state.switchOn ? 1 : 0;

    const {
      projectId,
      projectName,
      projectDes,
      projectProgress,
      projectStartTime,
      projectEndTime,
      projectStartLeft,
      projectEndLeft,
      projectTaskLeft,
      projectTaskLength,
      isoStartDate,
      isoEndDate,
    } = this.state;
    if (projectName == '' || projectEndDate == '' || projectStartDate == '') {
      Alert.alert('فیلد ها را پر کنید');
    } else {
      var date = new Date();
      let project = new Object();
      project.projectId = projectId;
      project.projectName = projectName;
      project.projectDes = projectDes;
      project.projectProgress = projectProgress;
      project.projectStartTime = projectStartTime;
      project.projectEndTime = projectEndTime;
      project.projectStartLeft = Math.floor(
        (new Date(projectStartTime) - date) / 3600000,
      );
      project.projectEndLeft = Math.floor(
        (new Date(projectEndTime) - date) / 3600000,
      );
      project.projectTaskLeft = projectTaskLeft;
      project.projectTaskLength = projectTaskLength;
      project.projectStartDate = projectStartDate;
      project.projectEndDate = projectEndDate;
      project.isoStartDate = isoStartDate;
      project.isoEndDate = isoEndDate;
      project.projectActivate = projectActivate;

      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO projectTable (projectId, projectName, projectDes, projectActivate, projectStartDate, projectEndDate, projectProgress, projectStartTime , projectEndTime , projectStartLeft, projectEndLeft , projectTaskLeft, projectTaskLength , isoStartDate , isoEndDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
          [
            projectId,
            projectName,
            projectDes,
            projectActivate,
            projectStartDate,
            projectEndDate,
            projectProgress,
            projectStartTime,
            projectEndTime,
            projectStartLeft,
            projectEndLeft,
            projectTaskLeft,
            projectTaskLength,
            isoStartDate,
            isoEndDate,
          ],

          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              tx.executeSql(
                'SELECT * FROM projectTable ORDER BY projectId DESC LIMIT 1',
                [],
                (tx, results) => {
                  console.log('Query completed');
                  var projects = new Object();
                  var date = new Date();
                  var len = results.rows.length;

                  for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    row.projectStartLeft = Math.floor(
                      (new Date(row.projectStartTime) - date) / 3600000,
                    );
                    row.projectEndLeft = Math.floor(
                      (new Date(row.projectEndTime) - date) / 3600000,
                    );
                    projects.projectId = row.projectId;
                    projects.projectName = row.projectName;
                    projects.projectDes = row.projectDes;
                    projects.projectProgress = row.projectProgress;
                    projects.projectStartTime = row.projectStartTime;
                    projects.projectEndTime = row.projectEndTime;
                    projects.projectStartLeft = Math.floor(
                      (new Date(row.projectStartTime) - date) / 3600000,
                    );
                    projects.projectEndLeft = Math.floor(
                      (new Date(row.projectEndTime) - date) / 3600000,
                    );
                    projects.projectTaskLeft = row.projectTaskLeft;
                    projects.projectTaskLength = row.projectTaskLength;
                    projects.projectStartDate = row.projectStartDate;
                    projects.projectEndDate = row.projectEndDate;
                    projects.isoStartDate = row.isoStartDate;
                    projects.isoEndDate = row.isoEndDate;
                    projects.projectActivate = row.projectActivate;
                  }

                  PushNotification.localNotificationSchedule({
                    date: new Date(
                      Date.now() + (projects.projectStartLeft + 8) * 3600000,
                    ),
                    autoCancel: true,
                    largeIcon: 'ic_launcher',
                    smallIcon: 'ic_launcher',
                    bigText: `پروژه ${projects.projectName} شروع شد، برای فعالیت های این پروژه آماده باشید`,
                    subText: 'پروژه جدید شروع شد',
                    color: '#00bcd4',
                    title: 'شروع پروژه جدید',
                    message:
                      'پروژه جدیدی شروع شده حواست باشه از برنامه جا نمونی ',
                    playSound: true,
                    soundName: 'default',
                    vibrate: false,
                  });

                  this.AddProject(projects);
                },
              );
            }
          },
        );

        // this.props.navigation.navigate('Home',{
        //   project: project
        // }),
      });
    }
  };

  render() {
    return (
      <ScrollView>
        <View style={{flex: 1, height: '100%'}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: '#00ACC1',
              paddingLeft: '2%',
              paddingRight: '2%',
            }}>
            <Modal
              isVisible={this.state.gobackModal}
              animationIn="slideInLeft"
              onBackButtonPress={this.toggleGoBack}
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
              backgroundColor: '#00ACC1',
            }}>
            <Text
              style={{
                fontSize: 24,
                color: 'white',
                marginLeft: 110,
                marginBottom: 10,
              }}>
              نام پروژه:
            </Text>
            <TextInput
              onChangeText={projectName => this.setState({projectName})}
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
          <View style={{flex: 1, marginTop: '10%'}}>
            <View style={styles.itemView}>
              <TextInput
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  color: '#212121',
                  fontSize: 14,
                  fontFamily: 'IRANSansMobile_Medium',
                  width: 200,
                  borderWidth: 2,
                  // borderBottomWidth: 2,
                  borderColor: '#00bcd4',
                  marginTop: -20,
                  paddingBottom: -10,
                  // paddingRight: 5,
                  marginRight: 10,
                }}
                onChangeText={projectDes => this.setState({projectDes})}
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
                  style={{color: '#0097A7', fontSize: 36, marginLeft: -10}}
                />
                <Text style={{marginLeft: -45}}>توضیحات :</Text>
              </View>
            </View>
            <View style={styles.itemcolumn}>
              <View style={{flexDirection: 'row', marginLeft: 120}}>
                <SwitchToggle
                  containerStyle={{
                    // marginTop: 16,
                    width: 50,
                    height: 18,
                    borderRadius: 25,
                    // backgroundColor: '#ccc',
                    padding: 5,
                  }}
                  circleStyle={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    // backgroundColor: 'white', // rgb(102,134,205)
                  }}
                  circleColorOn="#0097A7"
                  circleColorOff="#BDBDBD"
                  switchOn={this.state.switchOn}
                  onPress={() => {
                    if (this.state.switchOn == true) {
                      this.setState({switchOn: false});
                    } else {
                      this.setState({switchOn: true});
                    }
                  }}
                />

                <Text style={{marginLeft: 10, marginRight: 10}}>فعال بودن</Text>
                <Icon
                  name="checkmark"
                  type="Ionicons"
                  style={{color: '#0097A7', fontSize: 36}}
                />
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 12, color: '#757575'}}>
                  تنها پروژه های فعال در داشبورد نمایش داده می شوند
                </Text>
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
                // style={{backgroundColor: 'white', borderWidth: 1}}
              >
                <View
                  style={{
                    justifyContent: 'center',
                    width: '90%',
                    height: 330,
                    backgroundColor: 'white',
                    marginLeft: '5%',
                    // borderWidth: 1,
                    borderRadius: 10,
                  }}>
                  <PersianCalendarPicker
                    height={320}
                    onDateChange={this.onDateChange}
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
                    minDate={new Date()}
                    todayBackgroundColor="#ffa000"
                    selectedDayColor="#00BCD4"
                    allowRangeSelection={true}
                  />
                  <TouchableOpacity
                    style={{width: 50, height: 40 ,borderRadius:5 , backgroundColor:'#00bcd4' , marginLeft:20, justifyContent:'center'}}
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
                    بازه زمانی پروژه
                  </Text>
                </View>
                <Icon
                  name="calendar-day"
                  type="FontAwesome5"
                  style={{color: '#0097A7', fontSize: 36}}
                />
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#00bcd4',
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
    backgroundColor: '#00bcd4',
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
export {CreateProjectScreen};

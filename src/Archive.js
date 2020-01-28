import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  StatusBar,
  Text,
  ToastAndroid,
} from 'react-native';



import SQLite from 'react-native-sqlite-storage';

import Modal from 'react-native-modal';

import {AnimatedCircularProgress} from 'react-native-circular-progress';
let db = null;
class Archive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DATA: [],
      flatlistrefresh: false,
      ModalVisible: false,
      visible: false,
    };
  }
  componentDidMount=()=>{
    this.componentDidFocus();
    this.focusListener = this.props.navigation.addListener(
      'didFocus',
      this.componentDidFocus,
    );
  }
  componentDidFocus=()=> {
    // console.log('this.props.project');

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
      tx.executeSql('SELECT * FROM projectTable', [], (tx, results) => {
        // console.log('Query completed');
        var temp = [];
        var len = results.rows.length;
        // console.log(len);
        var date = new Date();
        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          // console.log(date);
          // console.log(Date.parse(date));
          // console.log(new Date(row.projectStartTime));
          row.projectStartLeft = Math.floor(
            (new Date(row.projectStartTime) - date) / 3600000,
          );
          row.projectEndLeft = Math.floor(
            (new Date(row.projectEndTime) - date) / 3600000,
          );
          temp.push(row);
        }
        // console.log(this.state.DATA);
        this.setState({
          DATA: temp,
        });
        console.log(this.state.DATA);
      });
    });
  }

  componentWillUnmount() {
    this.focusListener.remove();
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
  hideToast = () => {
    this.setState({
      visible: false,
    });
  };
  callback(projects) {
    this.setState({visible: true}, () => {
      this.hideToast();
    });
    let temp = this.state.DATA;
    temp.push(projects);
    this.setState({DATA: temp, flatlistrefresh: true});
  }

  toggleDrawer = () => {
    //Props to open/close the drawer
    this.props.navigationProps.toggleDrawer();
  };
  pressMain = () => {
    this.setState({flatlistrefresh: false});
    this.props.navigation.navigate('createProject', {
      callback: this.callback.bind(this),
    });
  };
  updateProgress = (projectProgress, id) => {
    const newData = [...this.state.DATA];
    for (let i = 0; i < newData.length; i++) {
      if (newData[i].projectId == id)
        newData[i].projectProgress = projectProgress;
    }

    this.setState({DATA: newData});
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE projectTable set projectProgress=${projectProgress} WHERE projectId=${id}`,
        [],
      ),
        console.log('upadated');
    });
  };
  toggleModal = () => {
    this.setState({ModalVisible: !this.state.ModalVisible});
  };
  projectState = projectId => {
    this.setState({ModalVisible: !this.state.ModalVisible, newID: projectId});
    this.renderModalContent(projectId);
  };
  renderModalContent = () => {
    const {newID} = this.state;
    return (
      <View style={styles.deleteModal}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 14, textAlign: 'center'}}>
            توجه !! برای دسترسی به فعالیت های پروژه می توانید از فعال سازی
            استفاده کنید و در صورت حذف کردن پروژه به طور کل پاک خواهد شد
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
            onPress={() => this.removeItem(newID)}>
            <Text style={{color: 'white', textAlign: 'center'}}>حذف کردن</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.archiveTouch}
            onPress={() => this.getActive(newID)}>
            <Text style={{color: 'white', textAlign: 'center'}}>فعال سازی</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  getActive = projectId => {
    const {DATA} = this.state;
    this.setState({
      ModalVisible: !this.state.ModalVisible,
    });
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE projectTable SET projectActivate=1 WHERE projectId=${projectId}`,
        [],
      );
    });
  };

  removeItem = projectId => {
    const {DATA} = this.state;
    this.setState({
      DATA: DATA.slice().filter(item => item.projectId !== projectId),
      ModalVisible: !this.state.ModalVisible,
    });

    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM projectTable WHERE projectId=${projectId}`,
        [],
      ),
        tx.executeSql(`DELETE FROM taskTable WHERE projectId=${projectId}`, []),
        console.log('DELETED');
    });
  };

  displayTime = item => {
    if (item.projectStartLeft > 0) {
      if (item.projectStartLeft > 24) {
        return (
          <Text style={{color: '#FFA000', textAlign: 'center', fontSize: 12}}>
            {Math.floor(item.projectStartLeft / 24)} روز تا شروع پروژه
          </Text>
        );
      } else {
        return (
          <Text style={{color: '#FFA000', textAlign: 'center', fontSize: 12}}>
            {item.projectStartLeft} ساعت تا شروع پروژه
          </Text>
        );
      }
    } else {
      if (item.projectEndLeft > 0) {
        if (item.projectEndLeft > 24) {
          return (
            <Text style={{color: '#1e7807', textAlign: 'center', fontSize: 12}}>
              {Math.floor(item.projectEndLeft / 24)} روز تا پایان پروژه مانده
            </Text>
          );
        } else {
          return (
            <Text style={{color: '#a3081d', textAlign: 'center', fontSize: 12}}>
              {item.projectEndLeft} ساعت تا پایان پروژه مانده
            </Text>
          );
        }
      } else {
        return (
          <Text style={{color: '#4a4646', textAlign: 'center', fontSize: 12}}>
            زمان پروژه به پایان رسید
          </Text>
        );
      }
    }
  };

  render() {
    const {navigation} = this.props;

    return (
      <View style={{flex: 1}}>
       <StatusBar backgroundColor="#00a0b5" barStyle="light-content" />

        <FlatList
          numColumns={4}
          data={this.state.DATA}
          extraData={this.state.flatlistrefresh}
          // ListEmptyComponent={}
          renderItem={({item, index}) => (
            <View
              style={{
                width: '25%',
                flexDirection: 'row-reverse',
                justifyContent: 'space-around',
              }}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => this.projectState(item.projectId)}
                // onLongPress={()=> this.props.deleteItem(this.props.item.projectId)}
              >
                <View style={{flex: 1, height: 80}}>
                  <AnimatedCircularProgress
                    size={60}
                    width={2}
                    fill={item.projectProgress}
                    rotation={0}
                    tintColor="#26C6DA"
                    ref={ref => (this.circularProgress = ref)}
                    duration={1000}
                    backgroundColor="#FAFAFA">
                    {fill => (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={{fontSize: 20, color: '#26C6DA'}}>
                          {Math.round(fill)}
                        </Text>
                        <Text style={{fontSize: 15, color: '#26C6DA'}}>%</Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>
                </View>

                <View style={{flex: 1, height: 60, paddingTop: 10}}>
                  <Text style={{fontSize: 14, color: '#00BCD4'}}>
                    {item.projectName}
                  </Text>
                </View>

                <View style={{flex: 1, height: 60 , paddingHorizontal:3}}>
                  {this.displayTime(item)}
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => item.projectId}
        />
        <Modal
          isVisible={this.state.ModalVisible}
          animationIn="slideInLeft"
          onBackButtonPress={this.toggleModal}
          onBackdropPress={this.toggleModal}
          animationOut="slideOutRight">
          {this.renderModalContent()}
        </Modal>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  drawer: {shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
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
    height: 140,
    marginHorizontal: '12%',
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
    backgroundColor: '#cc0e2e',
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
  archiveTouch: {
    width: 80,
    height: 40,
    alignSelf: 'center',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#228a15',
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
    justifyContent: 'space-around',
    borderRadius: 6,
    height: 200,
    alignItems: 'center',
    margin: '2%',
    paddingTop: 20,
  },
});

export {Archive};

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






import {ProjectView} from './ProjectView';
import SQLite from 'react-native-sqlite-storage';

import Modal from 'react-native-modal';

import {Fab, Icon} from 'native-base';
let db = null;
class HomeScreen extends Component {
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
      tx.executeSql(
        'SELECT * FROM projectTable WHERE projectActivate=1',
        [],
        (tx, results) => {
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
        },
      );
    });
  }
  componentWillUnmount() {
    this.focusListener.remove();
  }

  onRegister(token) {
    // Alert.alert('Registered !', JSON.stringify(token));
    // console.log(token);
    this.setState({registerToken: token.token, gcmRegistered: true});
  }
  onNotif(notif) {
    // console.log(notif);
    Alert.alert(notif.title, notif.message);
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
  removeItemRender = projectId => {
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
          <Text style={{fontSize:14 , textAlign:'center'}}>توجه!! در صورت  بایگانی کردن تنها از صفحه داشبورد پاک می شود ولی در صورت حذف کردن پروژه کلا پاک می شود</Text>
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
            onPress={() => this.getArchive(newID)}>
            <Text style={{color: 'white', textAlign: 'center'}}>
              بایگانی کردن
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  getArchive = projectId => {
    const {DATA} = this.state;
    this.setState({
      DATA: DATA.slice().filter(item => item.projectId !== projectId),
      ModalVisible: !this.state.ModalVisible,
    });
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE projectTable SET projectActivate=0 WHERE projectId=${projectId}`,
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


  render() {
    const {navigation} = this.props;

    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="#00a0b5" barStyle="light-content" />
        <Toast visible={this.state.visible} message="پروژه جدید ساخته شد" />
        <FlatList
          numColumns={2}
          data={this.state.DATA}
          extraData={this.state.flatlistrefresh}
          ListEmptyComponent={()=>{
            return(
            <View style={{width:'100%' , marginTop:'60%'}}> 
              <Text style={{color:'#bbbec4', fontSize:18, textAlign:'center'}}>پروژه جدید ایجاد کنید</Text>
            </View>
            )
          }}
          // ListEmptyComponent={}
          renderItem={({item, index}) => (
            <ProjectView
              item={item}
              deleteItem={this.removeItemRender}
              navigation={navigation}
              toggleModal={this.toggleModal}
              projectId={item.projectId}
              projectName={item.projectName}
              projectStartLeft={item.projectStartLeft}
              projectEndLeft={item.projectEndLeft}
              projectProgress={item.projectProgress}
              projectTaskLeft={item.projectTaskLeft}
              updateProgress={this.updateProgress}
              projectTaskLength={item.projectTaskLength}
            />
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
        <View style={{marginBottom:'2%', marginLeft:'2%'}}>
        <Fab
          style={{backgroundColor: '#00BCD4'}}
          position="bottomLeft"
          onPress={this.pressMain}>
          <Icon name="plus" type="FontAwesome5" style={{fontSize: 16 }} />
        </Fab>
        </View>
        
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

export {HomeScreen};

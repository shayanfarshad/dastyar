import React, {Component} from 'react';
import {Icon, Row, ListItem, CheckBox, Body, Radio} from 'native-base';
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {Dropdown} from 'react-native-material-dropdown';
import SQLite from 'react-native-sqlite-storage';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {TextField} from 'react-native-material-textfield';
import Modal from 'react-native-modal';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import PersianNumber from './persiantext';
import Accordion from 'react-native-collapsible/Accordion';
import {MyCheckBox} from './MyCheckBox';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';

class AllTask extends Component {
  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.projectRef = this.updateRef.bind(this, 'project');
    this.taskRef = this.updateRef.bind(this, 'task');
    this.state = {
      task: [],
      projects: [],
      taskType: [],
      visibleModal: '',
      sortValue: 0,
      filterValue: 0,
      activeSections: [],
      multipleSelect: false,
      checked: false,
      selected: false,
      todaySelect: true,
      checkedArray: [],
      ShowText: '',
      i: 0,
      projectId: null,
    };
  }

  onChangeText(text, value) {
    ['project', 'task']
      .map(name => ({name, ref: this[name]}))
      .filter(({ref}) => ref && ref.isFocused())
      .forEach(({name, ref}) => {
        this.setState({[name]: text});
      });

    if (text == 'تمام پروژه ها') {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM taskTable', [], (tx, results) => {
          // console.log('Query completed');
          var temp = [];
          var len = results.rows.length;

          for (let i = 0; i < len; i++) {
            var task = new Object();
            let row = results.rows.item(i);

            task.taskName = row.taskName;
            task.taskDes = row.taskDes;
            task.taskDone = row.taskDone;
            task.taskProgress = row.taskProgress;
            task.taskStartDate = row.taskStartDate;
            task.taskEndDate = row.taskEndDate;
            task.taskStartTime = row.taskStartTime;
            task.taskEndTime = row.taskEndTime;
            task.taskType = row.taskType;
            task.isoStartDate = row.isoStartDate;
            task.isoEndDate = row.isoEndDate;
            task.projectId = row.projectId;
            temp.push(task);
          }
          this.setState({task: temp, ShowText: task.taskStartDate});
          // console.log(this.state.task);
        });
      });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM projectTable WHERE projectName LIKE '${text}'`,
          [],
          (tx, results) => {
            var id = null;
            var len = results.rows.length;
            // console.log('Query completed');

            for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);

              id = row.projectId;
            }

            tx.executeSql(
              `SELECT * FROM taskTable WHERE projectId=${id}`,
              [],
              (tx, results) => {
                // console.log('Query completed');
                var temp = [];
                var len = results.rows.length;

                for (let i = 0; i < len; i++) {
                  var task = new Object();
                  let row = results.rows.item(i);

                  task.taskName = row.taskName;
                  task.taskDes = row.taskDes;
                  task.taskDone = row.taskDone;
                  task.taskProgress = row.taskProgress;
                  task.taskStartDate = row.taskStartDate;
                  task.taskEndDate = row.taskEndDate;
                  task.taskStartTime = row.taskStartTime;
                  task.taskEndTime = row.taskEndTime;
                  task.taskType = row.taskType;
                  task.isoStartDate = row.isoStartDate;
                  task.isoEndDate = row.isoEndDate;
                  task.projectId = row.projectId;
                  temp.push(task);
                }

                this.setState({task: temp});
                // console.log(this.state.task);
              },
            );
          },
        );
      });
    }
  }
  componentDidMount = () => {
    this.componentDidFocus();
    this.focusListener = this.props.navigation.addListener(
      'didFocus',
      this.componentDidFocus,
    );
  };

  componentDidFocus = () => {
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
        var projects = [{value: 'تمام پروژه ها'}];
        var len = results.rows.length;

        for (let i = 0; i < len; i++) {
          var project = new Object();
          let row = results.rows.item(i);

          project.value = row.projectName;

          projects.push(project);
        }
        this.setState({projects: projects});
      });
      tx.executeSql('SELECT * FROM taskTable', [], (tx, results) => {
        // console.log('Query completed');
        var temp = [];
        var len = results.rows.length;
        if (len == 0) {
          this.setState({task: []});
        } else {
          for (let i = 0; i < len; i++) {
            var task = new Object();
            let row = results.rows.item(i);

            task.taskName = row.taskName;
            task.taskDes = row.taskDes;
            task.taskDone = row.taskDone;
            task.taskProgress = row.taskProgress;
            task.taskStartDate = row.taskStartDate;
            task.taskEndDate = row.taskEndDate;
            task.taskStartTime = row.taskStartTime;
            task.taskEndTime = row.taskEndTime;
            task.taskType = row.taskType;
            task.isoStartDate = row.isoStartDate;
            task.isoEndDate = row.isoEndDate;
            task.projectId = row.projectId;
            temp.push(task);
          }

          this.setState({task: temp, ShowText: task.taskStartDate});
        }
        // console.log(this.state.task);
      });
      tx.executeSql('SELECT * FROM taskType', [], (tx, results) => {
        // console.log('Query completed');
        var temp = [];
        var len = results.rows.length;

        for (let i = 0; i < len; i++) {
          var type = new Object();
          let row = results.rows.item(i);

          type.name = row.name;
          type.id = row.id;
          temp.push(type);
        }
        this.setState({taskType: temp});
        // console.log(this.state.taskType);
      });
    });
  };

  componentWillUnmount() {
    this.focusListener.remove();
  }
  updateRef(name, ref) {
    this[name] = ref;
  }
  /////////////////////////..................... MODAL ..............//////////////////
  sort = value => {
    var task = this.state.task;

    if (value == 0) {
      var sortedStartDate = task.sort(
        (a, b) => new Date(a.taskStartTime) - new Date(b.taskStartTime),
      );

      this.setState({i: 0, task: sortedStartDate});
    } else if (value == 1) {
      var sortedEndDate = task.sort(
        (a, b) => new Date(a.taskEndTime) - new Date(b.taskEndTime),
      );

      this.setState({i: 1, task: sortedEndDate});
    } else {
      var sortedPercent = task.sort((a, b) => a.taskDone - b.taskDone);
      this.setState({i: 2, task: sortedPercent});
    }
  };
  addToArrayChecked = (data, checked) => {
    let temp = this.state.checkedArray;

    if (checked) {
      var last = temp.indexOf(data);
      temp.splice(last, 1);
      this.setState({checkedArray: temp});
    } else {
      if (temp.indexOf(data) === -1) {
        temp.push(data);
      }
      this.setState({checkedArray: temp});
    }
  };
  find = () => {
    this.toggleModal();
    var checked = this.state.checkedArray;
    var checkedItem = checked.map(item => `'${item}'`).join(',');
    var NotDone = this.state.selected;
    var today = this.state.todaySelect;
    var date = new Date();
    var dateDay = date.getDate();
    var dateMonth = date.getMonth() + 1;
    var dateYear = date.getFullYear();
    var todayDate = `${dateMonth}/${dateDay}/${dateYear}`;

    if (today && NotDone && checkedItem !== '') {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM taskTable WHERE taskDone=0 AND taskType IN (${checkedItem}) `,
          [],
          (tx, results) => {
            // console.log('Query completed');
            var temp = [];
            var len = results.rows.length;

            if (len == 0) {
              this.setState({task: []});
            } else {
              for (let i = 0; i < len; i++) {
                var task = new Object();
                let row = results.rows.item(i);

                task.taskName = row.taskName;
                task.taskDes = row.taskDes;
                task.taskDone = row.taskDone;
                task.taskProgress = row.taskProgress;
                task.taskStartDate = row.taskStartDate;
                task.taskEndDate = row.taskEndDate;
                task.taskStartTime = row.taskStartTime;
                task.taskEndTime = row.taskEndTime;
                task.taskType = row.taskType;
                task.isoStartDate = row.isoStartDate;
                task.isoEndDate = row.isoEndDate;
                task.projectId = row.projectId;
                task.isoEndDate = row.isoEndDate;
                temp.push(task);
              }
              this.setState({
                task: temp,
                ShowText: task.taskStartDate,
              });
            }
            // console.log(this.state.task);
          },
        );
      });
    } else if (!today && NotDone) {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM taskTable WHERE taskStartTime NOT LIKE '${todayDate}' AND taskDone=0 AND taskType IN (${checkedItem}) `,
          [],
          (tx, results) => {
            console.log('Query completed');
            var temp = [];
            var len = results.rows.length;

            for (let i = 0; i < len; i++) {
              var task = new Object();
              let row = results.rows.item(i);

              task.taskName = row.taskName;
              task.taskDes = row.taskDes;
              task.taskDone = row.taskDone;
              task.taskProgress = row.taskProgress;
              task.taskStartDate = row.taskStartDate;
              task.taskEndDate = row.taskEndDate;
              task.taskStartTime = row.taskStartTime;
              task.taskEndTime = row.taskEndTime;
              task.taskType = row.taskType;
              task.isoStartDate = row.isoStartDate;
              task.projectId = row.projectId;
              task.isoEndDate = row.isoEndDate;
              temp.push(task);
            }
            this.setState({
              task: temp,
              ShowText: task.taskStartDate,
            });
            // console.log(this.state.task);
          },
        );
      });
    } else if (!today && !NotDone) {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM taskTable WHERE taskStartTime NOT LIKE '${todayDate}' AND taskType IN (${checkedItem})`,
          [],
          (tx, results) => {
            // console.log('Query completed');
            var temp = [];
            var len = results.rows.length;

            for (let i = 0; i < len; i++) {
              var task = new Object();
              let row = results.rows.item(i);

              task.taskName = row.taskName;
              task.taskDes = row.taskDes;
              task.taskDone = row.taskDone;
              task.taskProgress = row.taskProgress;
              task.taskStartDate = row.taskStartDate;
              task.taskEndDate = row.taskEndDate;
              task.taskStartTime = row.taskStartTime;
              task.taskEndTime = row.taskEndTime;
              task.taskType = row.taskType;
              task.isoStartDate = row.isoStartDate;
              task.isoEndDate = row.isoEndDate;
              task.projectId = row.projectId;
              temp.push(task);
            }
            this.setState({
              task: temp,
              ShowText: task.taskStartDate,
            });
            // console.log(this.state.task);
          },
        );
      });
    } else if (today && !NotDone && checkedItem !== '') {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM taskTable WHERE taskType IN (${checkedItem}) `,
          [],
          (tx, results) => {
            // console.log('Query completed');
            var temp = [];
            var len = results.rows.length;

            if (len == 0) {
              this.setState({task: []});
            } else {
              for (let i = 0; i < len; i++) {
                var task = new Object();
                let row = results.rows.item(i);

                task.taskName = row.taskName;
                task.taskDes = row.taskDes;
                task.taskDone = row.taskDone;
                task.taskProgress = row.taskProgress;
                task.taskStartDate = row.taskStartDate;
                task.taskEndDate = row.taskEndDate;
                task.taskStartTime = row.taskStartTime;
                task.taskEndTime = row.taskEndTime;
                task.taskType = row.taskType;
                task.isoStartDate = row.isoStartDate;
                task.isoEndDate = row.isoEndDate;
                task.projectId = row.projectId;
                temp.push(task);
              }
            }
            this.setState({task: temp});
            // console.log(this.state.task);
          },
        );
      });
    } else if (today && NotDone && checkedItem === '') {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM taskTable WHERE taskDone=0`,
          [],
          (tx, results) => {
            // console.log('Query completed');
            var temp = [];
            var len = results.rows.length;

            for (let i = 0; i < len; i++) {
              var task = new Object();
              let row = results.rows.item(i);

              task.taskName = row.taskName;
              task.taskDes = row.taskDes;
              task.taskDone = row.taskDone;
              task.taskProgress = row.taskProgress;
              task.taskStartDate = row.taskStartDate;
              task.taskEndDate = row.taskEndDate;
              task.taskStartTime = row.taskStartTime;
              task.taskEndTime = row.taskEndTime;
              task.taskType = row.taskType;
              task.isoStartDate = row.isoStartDate;
              task.isoEndDate = row.isoEndDate;
              task.projectId = row.projectId;
              temp.push(task);
            }
            this.setState({task: temp});
            // console.log(this.state.task);
          },
        );
      });
    } else if (today && !NotDone && checkedItem === '') {
      db.transaction(tx => {
        tx.executeSql(`SELECT * FROM taskTable`, [], (tx, results) => {
          // console.log('Query completed');
          var temp = [];
          var len = results.rows.length;

          for (let i = 0; i < len; i++) {
            var task = new Object();
            let row = results.rows.item(i);

            task.taskName = row.taskName;
            task.taskDes = row.taskDes;
            task.taskDone = row.taskDone;
            task.taskProgress = row.taskProgress;
            task.taskStartDate = row.taskStartDate;
            task.taskEndDate = row.taskEndDate;
            task.taskStartTime = row.taskStartTime;
            task.taskEndTime = row.taskEndTime;
            task.taskType = row.taskType;
            task.isoStartDate = row.isoStartDate;
            task.isoEndDate = row.isoEndDate;
            task.projectId = row.projectId;
            temp.push(task);
          }
          this.setState({task: temp});
          // console.log(this.state.task);
        });
      });
    }
  };
  radioSelect = () => {
    this.setState({selected: !this.state.selected});
  };
  isTodaySelect = () => {
    this.setState({todaySelect: !this.state.todaySelect});
  };
  toggleModal = () => {
    this.setState({visibleModal: !this.state.visibleModal});
  };

  //////////////////////////////////...........................END MODAL ................////////////////////////

  renderContent = task => {
    if (this.state.i == 0) {
      return (
        <View style={{flex: 0.3}}>
          <PersianNumber style={{color: 'white'}}>
            {task.taskStartDate}
          </PersianNumber>
        </View>
      );
    } else if (this.state.i == 1)
      return (
        <View style={{flex: 0.3}}>
          <PersianNumber style={{color: 'white'}}>
            {task.taskEndDate}
          </PersianNumber>
        </View>
      );
    else
      return (
        <View style={{flex: 0.3}}>
          <PersianNumber style={{color: 'white'}}>
            {task.taskProgress} %
          </PersianNumber>
        </View>
      );
  };
  //////////////////////////......................ACCORDIAN .................//////////////////
  _renderHeader = task => {
      return (
        <View style={styles.accordian_header}>
          {this.renderContent(task)}
          <View style={{flex: 0.2}}>
            <Text style={{color: 'white', textAlign: 'left'}}>
              {task.taskType}
            </Text>
          </View>

          <View style={{flex: 0.5, paddingRight: 10}}>
            <Text style={{color: 'white', textAlign: 'right'}}>
              {task.taskName}
            </Text>
          </View>
        </View>
      );
    
  };

  _renderContent = task => {
      return (
        <View
          style={styles.accordian_content}>
          <View
            style={{
              flex: 0.75,
              height: '100%',
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              // borderWidth: 1,
            }}>
            <Text>درباره رویداد:{task.taskDes}</Text>
          </View>
          <View
            style={{
              flex: 0.25,
              height: '100%',
              marginTop: '-5%',
              justifyContent: 'space-around',
              alignItems: 'center',
              // borderWidth: 1,
            }}>
            <Text>درصد پیشرفت</Text>
            {task.taskDone ? (
              <AnimatedCircularProgress
                size={40}
                width={2}
                fill={100}
                rotation={0}
                tintColor="#26C6DA"
                ref={ref => (this.circularProgress = ref)}
                duration={500}
                // onAnimationComplete={()=> this.circularProgress.stopAnimation(Math.round(fill.value))}
                backgroundColor="#FAFAFA">
                {fill => (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{fontSize: 12, color: '#26C6DA'}}>
                      {Math.round(fill)}
                    </Text>
                    <Text style={{fontSize: 10, color: '#26C6DA'}}>%</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            ) : (
              <AnimatedCircularProgress
                size={40}
                width={2}
                fill={0}
                rotation={0}
                tintColor="#26C6DA"
                ref={ref => (this.circularProgress = ref)}
                duration={500}
                backgroundColor="#FAFAFA">
                {fill => (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{fontSize: 12, color: '#26C6DA'}}>
                      {Math.round(fill)}
                    </Text>
                    <Text style={{fontSize: 10, color: '#26C6DA'}}>%</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            )}
          </View>
        </View>
      );
    
  };
  ////////////////////////////.......................END ACCORDIAN .................///////////////////

  render() {
    let {project} = this.state;
    const {navigation} = this.props;
    return (
      <View style={{flex: 1}}>
        <StatusBar backgroundColor="#00a0b5" barStyle="light-content" />
        <View style={styles.main_render}>
          <TouchableOpacity
            style={styles.sort_touch}
            onPress={() => this.setState({visibleModal: 'sort'})}>
            <Text style={{color: 'white'}}>مرتب سازی</Text>
          </TouchableOpacity>
          <Modal
            isVisible={this.state.visibleModal === 'sort'}
            animationIn="slideInLeft"
            onBackButtonPress={this.toggleModal}
            onBackdropPress={this.toggleModal}
            animationOut="slideOutRight">
            <View style={styles.sort_modal}>
              <TouchableOpacity
                style={{justifyContent: 'center', alignItems: 'center'}}>
                <RadioForm
                  radio_props={sort_radio_props}
                  initial={this.state.sortValue}
                  onPress={value => {
                    this.setState({sortValue: value, visibleModal: null});
                    this.sort(value);
                  }}
                />
              </TouchableOpacity>
            </View>
          </Modal>
          <Dropdown
            ref={this.projectRef}
            value={project}
            onChangeText={this.onChangeText}
            selectedItemColor="#00bcd4"
            // valueExtractor={(value)=> this.filterProject(value)}
            label="پروژه"
            data={this.state.projects}
            containerStyle={{
              width: '45%',
              justifyContent: 'center',
              marginLeft: 10,
              marginRight: 10,
            }}
          />

          <TouchableOpacity
            style={styles.filter_touch}
            onPress={() => this.setState({visibleModal: 'filter'})}>
            <Text style={{color: 'white'}}>فیلتر کردن</Text>
          </TouchableOpacity>
          <Modal
            isVisible={this.state.visibleModal === 'filter'}
            animationIn="slideInLeft"
            onBackButtonPress={this.toggleModal}
            onBackdropPress={this.toggleModal}
            animationOut="slideOutRight">
            <View style={styles.filter_modal}>
              <View
                style={{
                  backgroundColor: '#00bcd4',
                  paddingRight: 10,
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                  elevation: 4,
                  height: 30,
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'white'}}>موضوع فعالیت</Text>
              </View>
              <View style={{height: 200}}>
                <ScrollView>
                  {this.state.taskType.map(data => {
                    return (
                      <MyCheckBox
                        data={data.name}
                        key={data.id}
                        onChecked={this.addToArrayChecked}
                        checkedItem={this.state.checkedArray}
                      />
                    );
                  })}
                </ScrollView>
              </View>

              <View
                style={{
                  backgroundColor: '#00bcd4',
                  paddingRight: 10,
                  elevation: 4,
                  height: 30,
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'white'}}>وضعیت فعالیت</Text>
              </View>
              <ListItem style={{height: 50}}>
                <Radio
                  color="#81d4fa"
                  selectedColor="#00bcd4"
                  selected={this.state.selected}
                  onPress={this.radioSelect}
                />

                <Body>
                  <Text>فعالیت های انجام نشده</Text>
                </Body>
              </ListItem>
              <ListItem style={{height: 50}}>
                <Radio
                  color="#81d4fa"
                  selectedColor="#00bcd4"
                  selected={!this.state.selected}
                  onPress={this.radioSelect}
                />

                <Body>
                  <Text>تمام فعالیت ها </Text>
                </Body>
              </ListItem>

              <View
                style={{
                  backgroundColor: '#00bcd4',
                  paddingRight: 10,
                  elevation: 4,
                  height: 30,
                  justifyContent: 'center',
                }}>
                <Text style={{color: 'white'}}>فعالیت های امروز</Text>
              </View>
              <ListItem style={{height: 50}} onPress={this.isTodaySelect}>
                <CheckBox
                  checked={this.state.todaySelect}
                  onPress={this.isTodaySelect}
                  color="#00bcd4"
                />
                <Body>
                  <Text>فعالیت های امروز</Text>
                </Body>
              </ListItem>
              <TouchableOpacity style={styles.find_touch} onPress={this.find}>
                <Text style={{color: 'white'}}>جستجو</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        <ScrollView>
          <Accordion
            sections={this.state.task}
            activeSections={this.state.activeSections}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
            onChange={activeSections => this.setState({activeSections})}
            touchableComponent={TouchableOpacity}
            expandMultiple={this.state.multipleSelect}
          />
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  accordian_header: {
    height: 80,
    marginLeft: '2%',
    marginRight: '2%',
    marginTop: '1%',
    marginBottom: '1%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#00bcd4',
    borderRadius: 5,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
    paddingLeft: 10,
  },
  accordian_content: {
    flex: 1,
    flexDirection: 'row',
    // borderWidth: 1,
    padding: '2%',
    height: 100,
    marginHorizontal: '2%',
    marginBottom:'2%',
    flexDirection: 'row-reverse',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  main_render: {
    flexDirection: 'row',
    width: '96%',
    margin: '2%',
    padding: '2%',
    justifyContent: 'center',
    borderRadius: 5,
    height: 80,
    // borderWidth: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  sort_touch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#00bcd4',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 3,
    elevation: 5,
  },
  filter_touch: {
    flexDirection: 'row',
    padding: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00bcd4',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 3,
    elevation: 5,
  },
  find_touch: {
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
  filter_modal: {
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 10,
    borderColor: 'white',
    width: '76%',
    height: 515,
    marginHorizontal: '12%',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    // paddingTop: 10,
  },
  sort_modal: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 5,
    width: '40%',
    height: 120,
    marginHorizontal: '30%',
    justifyContent: 'flex-end',
    // paddingTop: 10,
    paddingRight: 10,
  },
});

const sort_radio_props = [
  {label: 'تاریخ شروع', value: 0},
  {label: 'تاریخ پایان', value: 1},
  {label: 'درصد پیشرفت', value: 2},
];
export {AllTask};

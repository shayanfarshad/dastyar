/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { HomeScreen } from './src/HomeScreen';
import { StyleSheet, View, Text, StatusBar, Image } from 'react-native';
import { CreateProjectScreen } from './src/CreateProjectScreen';
import { AllTask } from './src/AllTask';
import PushNotification from 'react-native-push-notification';
import { ProjectDetail } from './src/ProjectDetail';
import { CreateTaskScreen } from './src/CreateTaskScreen';
import { createDrawerNavigator, DrawerSidebar } from 'react-navigation-drawer';
import { Panel } from './src/Panel';
import { HeadBar } from './src/Headbar';
import LottieView from 'lottie-react-native';
import { Archive } from './src/Archive';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
    let oldRender = Text.render;
    Text.render = function (...args) {
      let origin = oldRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [{ fontFamily: 'Vazir-FD' }, origin.props.style],
      });
    };
  }
  toggleDrawer = () => {
    this.props.navigationProps.toggleDrawer();
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1}}>
          <StatusBar hidden />
          <View
            style={{
              flex: 1,
              paddingTop: 50,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#01579B',
            }}>
            <Image
              style={{ width: '50%', height: '30%' }}
              source={require('./assets/img/logo3.png')}
            />{' '}
            <Text style={{ fontSize: 30, color: 'white' }}> دست یار </Text>{' '}
            <LottieView
              source={require('./assets/animation/loading5.json')}
              autoPlay
              duration={4000}
              loop={false}
              style={{ width: 400, marginTop: -50 }}
              onAnimationFinish={() => this.setState({ isLoading: false })}
            />{' '}
          </View>{' '}
        </View>
      );
    }
    return <AppContainer> </AppContainer>;
  }
}
const Home_stack = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => ({
      header: <HeadBar navigationProps={navigation} pageName="داشبورد" />,
    }),
  },
  projectDetail: ProjectDetail,
  createProject: CreateProjectScreen,
  createTask: CreateTaskScreen,
});
const Alltask_stack = createStackNavigator({
  AllTask: {
    screen: AllTask,
    navigationOptions: ({ navigation }) => ({
      header: <HeadBar navigationProps={navigation} pageName="فعالیت ها" />,
    }),
  },
});
const Archive_stack = createStackNavigator({
  Archive: {
    screen: Archive,
    navigationOptions: ({ navigation }) => ({
      header: <HeadBar navigationProps={navigation} pageName="بایگانی" />,
    }),
  },
});
// const TaskOption_Stack = createStackNavigator({
//   TaskOption: {
//     screen: TaskOption,
//     navigationOptions: ({navigation}) => ({
//       header: (
//         <HeadBar navigationProps={navigation} pageName="تنظیمات رویدادها" />
//       ),
//     }),
//   },
// });

const DrawerNavigator = createDrawerNavigator(
  {
    //Drawer Optons and indexing
    Home: {
      screen: Home_stack,
    },
    Task: {
      screen: Alltask_stack,
    },
    Archive: {
      screen: Archive_stack,
    },
    // TaskOption: {
    //   screen: TaskOption_Stack,
    // },
  },
  {
    contentComponent: Panel,
    drawerWidth: '70%',
    drawerPosition: 'right',
    drawerType: 'front',
  },
);

const AppContainer = createAppContainer(DrawerNavigator);

export default App;

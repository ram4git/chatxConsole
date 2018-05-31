import React from 'react';
import { StyleSheet } from 'react-native';
import { StackNavigator } from 'react-navigation';
import ChatScreen from './Chat';
import FeedbackScreen from './Feedback';
import UserFormScreen from './InfoForm';
import LandingScreen from './Landing';



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


// Navigator
const StackNavigtor = StackNavigator(
	{
	  Home: {
	    screen: LandingScreen,
	  },
		Chat: {
			screen: ChatScreen,
		},
		Info: {
			screen: UserFormScreen,
		},
		Feedback: {
			screen: FeedbackScreen
		}
	},
	{
		initialRouteName: 'Home'
	}
);


export default class App extends React.Component {
  render() {
    return (
			<StackNavigtor />
    );
  }
}

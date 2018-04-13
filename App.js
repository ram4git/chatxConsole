import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { StackNavigator } from 'react-navigation';
import LandingScreen from './Landing';
import ChatScreen from './Chat';



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

import React, { Component } from 'react';
import { Button, ScrollView, StyleSheet } from 'react-native';
import { TextField } from 'react-native-material-textfield';





export default class InfoForm extends Component {

	static navigationOptions = ({navigation}) => (
		{
			title: `Your Question`,
			headerTintColor: '#ffffff',
			headerStyle: {
				backgroundColor: '#00539d',
				borderBottomColor: '#ffffff',
				borderBottomWidth: 3,
			},
			headerTitleStyle: {
				fontSize: 18,
			},
		}
	)

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	onFieldValueChange(field, value) {
		this.setState({
			[field]: value
		});
	}

	// use BSWInputText in the actualApp

	render() {
		const { data } = this.props.navigation.state.params;
		return (
			<ScrollView style={s.container}>
				<TextField
					label='Full Name'
					value={this.state.fullName}
					onChangeText={this.onFieldValueChange.bind(this, 'fullName')}
				/>
				<TextField
					label='Email'
					value={this.state.email}
					onChangeText={this.onFieldValueChange.bind(this, 'email')}
				/>
				<TextField
					label='Phone'
					value={this.state.phone}
					onChangeText={this.onFieldValueChange.bind(this, 'phone')}
				/>
				<TextField
					label='Account Number'
					value={this.state.accountNumber}
					onChangeText={this.onFieldValueChange.bind(this, 'accountNumber')}
				/>
				<TextField
					style={s.textArea}
					label='Your Question'
					value={this.state.question}
					multiline={true}
					onChangeText={this.onFieldValueChange.bind(this, 'question')}
				/>
				<Button
					style={s.button}
					onPress={() => this.props.navigation.navigate('Chat', {data: {...this.state, ...data}})}
					title='Start Chat'
				/>
			</ScrollView>
		);
	}

}

const s = StyleSheet.create({
	container: {
		flex: 1,
		marginLeft: 20,
		marginRight: 20
	},
	textArea: {
		height: 160
	},
});

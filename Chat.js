import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { GiftedChat, Send } from 'react-native-gifted-chat';

const s = StyleSheet.create({
	chatWindow: {
		flex: 1,
		backgroundColor: 'white',
	},
	send: {
		backgroundColor: 'red',
	}
});


export default class ChatScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: []
		};
	}

	static navigationOptions = ({navigation}) => (
		{
			title: `Chat - ${navigation.state.params.data.navTitle}`,
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
	);


	componentDidMount() {
		this.setState({
			messages: [
				{
					_id: 1,
					text: 'Hello, how can I help you?',
					createdAt: new Date(),
					user: {
						_id: 2,
					},
				},
			],
		});
	}

	onSend(messages = []) {
		const botMessage = {...messages[0]};
		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, [{ ...botMessage }])
		}));
		setTimeout(() => this.botSend(botMessage), 1000)
	}

	botSend(message) {
		const botMessage = { ...message };
		const alteredBotMessage = botMessage.text.split(' ').join('_');
		botMessage.text = `You said ${alteredBotMessage}`;
		botMessage._id = Math.round(Math.random() * 1000000);
		botMessage.user = {
			_id: 2,
			createdAt: new Date()
		};

		this.setState(previousState => ({
			messages: GiftedChat.append(previousState.messages, botMessage),
		}));

	}

	renderSend(props) {
		return (
			<Send {...props} style={s.send}>

			</Send>
		);
	}

	render() {
		return(
			<View style={s.chatWindow}>
				<GiftedChat
					messages={this.state.messages}
					onSend={messages => this.onSend(messages)}
					showUserAvatar={false}
					showAvatarForEveryMessage={false}
					renderAvatar={() => null}
					renderSend={this.renderSend.bind(this)}
					user={{
						_id: 1,
					}}
				/>
			</View>
		)
	}
}

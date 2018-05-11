import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { sendMessage, startChat } from './api';
import ChatContainer from './containers/ChatContainer';
import ErrorBoundary from './containers/ErrorBoundary';

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
		const { fullName:name, email, phone, accountNumber, question:subject } = this.props.navigation.state.params.data;
		const messages = [{
			_id: 1,
			text: `Hello ${name}, please confirm your details while we begin to help you! ${email ? `\n Email: ${email}` : ''} ${phone ? `\n Phone: ${phone}` : ''} ${accountNumber ? `\n Account Number: ${accountNumber}` : ''}`,
			createdAt: new Date(),
			user: {
				_id: 2,
			},
		}];
		if (subject) {
			messages.push({
				_id: 2,
				text: `${subject}`,
				createdAt: new Date(),
				user: {
					_id: 1,
				},
			});
		}
		this.setState({
			messages
		});
		setTimeout(startChat({
			name,
			email,
			phone,
			accountNumber,
			subject
		}), 2000);
		//setTimeout(checkAgentAvailability, 1000);
	}

	onSend(messages = []) {
		const botMessage = {...messages[0]};
		const { fullName } = this.props.navigation.state.params.data;

		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, [{ ...botMessage }])
		}));
		setTimeout(() => this.botSend(botMessage), 1000);
		console.log('MESSAGE AT SEND = ' + JSON.stringify(botMessage, null, 2));
		sendMessage({
			from: 'From App #2',
			body: botMessage.text,
			messageType: 'chat'
		});
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
				<ErrorBoundary>
					<ChatContainer>
						<GiftedChat
							messages={this.state.messages}
							onSend={messages => this.onSend(messages)}
							showUserAvatar={false}
							showAvatarForEveryMessage={false}
							renderAvatar={() => null}
							renderSend={this.renderSend.bind(this)}
							loadEarlier={true}
							user={{
								_id: 1,
							}}
						/>
					</ChatContainer>
				</ErrorBoundary>
			</View>
		)
	}
}

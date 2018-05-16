import React, { Component } from 'react';
import { NativeModules, StyleSheet, View } from 'react-native';
import { Bubble, GiftedChat, Send, SystemMessage } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/FontAwesome';
import GUID from 'uuid/v1';
import { sendMessage, startChat, startChatHub } from './api';
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
		const sessionId = GUID();
		console.log('GENERATED SESSION ID =', sessionId);
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
		startChatHub(sessionId, this.onMessageReceived.bind(this));
		setTimeout(startChat({
			name,
			email,
			phone,
			accountNumber,
			subject,
			sessionId
		}), 4000);
		//setTimeout(checkAgentAvailability, 1000);
	}

	onMessageReceived(message) {
		console.log('MSG RECVD=' + message);

		const messageObj = JSON.parse(message);
		const botMessage = {};
		botMessage._id = Math.round(Math.random() * 1000000);
		botMessage.user = {
			_id: 2,
			avatar: null
		};
		botMessage.createdAt =  new Date();

		const { body, messageType } =  messageObj.messages[0];
		botMessage.text = body;
		if(messageType === 'chat' || messageType === 'headline') {
			this.setState(previousState => ({
				messages: GiftedChat.append(previousState.messages, botMessage),
			}));
		} else if (messageType === 'useraction') {
			if(body === 'typing_start') {
				this.setState({
					isAgentTyping: true
				});
			} else if(body === 'typing_stop') {
				this.setState({
					isAgentTyping: false
				});
			}
		}
	}

	renderBubble(props) {
		return (
		  <Bubble
			{...props}
			wrapperStyle={{
			  left: {
				backgroundColor: '#f0f0f0',
			  }
			}}
		  />
		);
	  }

	renderSystemMessage(props) {
		return (
		  <SystemMessage
			{...props}
			containerStyle={{
			  marginBottom: 15,
			}}
			textStyle={{
			  fontSize: 14,
			}}
		  />
		);
	  }

	onSend(messages = []) {
		const botMessage = {...messages[0]};
		const { fullName } = this.props.navigation.state.params.data;

		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, [{ ...botMessage }])
		}));
		//setTimeout(() => this.botSend(botMessage), 1000);
		console.log('MESSAGE AT SEND = ' + JSON.stringify(botMessage, null, 2));
		sendMessage({
			from: fullName,
			body: botMessage.text,
			messageType: 'chat'
		});
	}

	botSend(message) {
		const botMessage = { ...message };
		const alteredBotMessage = botMessage.text.split(' ').join('_');
		botMessage.text = `You said ${alteredBotMessage}`;
		botMessage._id = Math.round(Math.random() * 1000000);
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

	renderActions() {
		return (
			<Icon
				name='plus-circle' 
				size={40}
				color='green'
				onPress={this.launchImageBrowser.bind(this)}
			/>
		);
	}

	launchImageBrowser() {
		const { ImagePickerManager } = NativeModules;
		ImagePickerManager.showImagePicker({}, () => {});
	}

	render() {
		const { fullName } = this.props.navigation.state.params.data;
		return(
			<View style={s.chatWindow}>
				<ErrorBoundary>
					<ChatContainer>
						<GiftedChat
							messages={this.state.messages}
							onSend={messages => this.onSend(messages)}
							showUserAvatar={true}
							showAvatarForEveryMessage={false}
							renderAvatar={() => null}
							renderSend={this.renderSend.bind(this)}
							loadEarlier={true}
							renderBubble={this.renderBubble.bind(this)}
							renderSystemMessage={this.renderSystemMessage.bind(this)}
							renderActions={this.renderActions.bind(this)}
							user={{
								_id: 1,
								name: fullName
							}}
						/>
					</ChatContainer>
				</ErrorBoundary>
			</View>
		)
	}
}

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import AnimatedEllipsis from 'react-native-animated-ellipsis';
import { GiftedChat, MessageText, Send, SystemMessage } from 'react-native-gifted-chat';
import HTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import GUID from 'uuid/v1';
import CustomActions from './CustomActions';
import { acceptAttachment, endChat, sendAttachment, sendMessage, setChatBeginTime, startChat, startChatHub } from './api';
import ChatContainer from './containers/ChatContainer';
import ErrorBoundary from './containers/ErrorBoundary';

 


const s = StyleSheet.create({
	chatWindow: {
		flex: 1,
		backgroundColor: 'white',
	},
	send: {
		backgroundColor: 'red',
	},
	footerContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
		alignItems: 'center',
	},
	footerText: {
		color: '#d35400'
	},
	ellipsis: {
		letterSpacing: -2,
	},
});

export default class ChatScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: []
		};
		this.sessionId = GUID();
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
            headerLeft: <Icon name='md-close' size={28} style={{marginLeft: 10}} onPress={() => {
				endChat(this.sessionId);
				navigation.navigate('Feedback', {data: {...this.state, sessionId: this.sessionId}})}
			} color='white' />

		}
	);

	componentWillUnmount() {
	  console.log('AABBCC');
	}
	
	componentDidMount() {
		const { fullName:name = '', email, phone, accountNumber, question:subject = 'Hello!' } = this.props.navigation.state.params.data;
		const modifiedSubject = `<strong>${subject}</strong> <br />My details are <br /> <em>${name ? `<strong>Name</strong>: ${name} <br />` : ''} ${email ? `<strong>Email</strong>: ${email} <br />` : ''} ${phone ? `<strong>Phone</strong>: ${phone}<br />` : ''} ${accountNumber ? `<strong>Account Number</strong>: ${accountNumber}<br />` : ''}</em>`;
		const messages = GiftedChat.append([], [{ 
			text: modifiedSubject,
			createdAt: new Date(),
			_id: Math.round(Math.random() * 1000000),
			user: {
				_id: 1,
				avatar: null,
				name
			},
		 }]);
		 
		this.setState({
			messages,
		});
		startChatHub(this.sessionId, this.onMessageReceived.bind(this))
		.then(
			startChat({
				name,
				email,
				phone,
				accountNumber,
				subject: modifiedSubject,
				sessionId: this.sessionId}
			)
			.then(data => {
				console.log('CHAT STARTED, SESSION-ID=', JSON.stringify(data, null, 2));
			})
		);
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

		const { body, messageType, from } =  messageObj.messages[0];
		const processedBody = this.handleEmoticons(body);
		botMessage.text = processedBody;

		//
		const regex = /^You are now chatting with .*$/g;
		const match = regex.exec(body);
		if(match) {
			setChatBeginTime();
		}

		if(messageType === 'chat' || messageType === 'headline') {
			if(body === 'AgentInitiateAttachment') {
				const { headlineParam } = messageObj.messages[0]['headlineData'];
				const attachmentProps = {};
				headlineParam.forEach(p => {
					attachmentProps[p.paramKey] = p.paramValue;
				});
				this.setState({
					isAgentUploading: true,
				});
				acceptAttachment(attachmentProps)
				.then(resp => {
					const attachmentMsg = {};
					attachmentMsg._id = Math.round(Math.random() * 1000000);
					attachmentMsg.image = resp;
					attachmentMsg.user = {
						_id: 2,
						avatar: null
					};
					attachmentMsg.createdAt =  new Date();
					this.setState(previousState => ({
						messages: GiftedChat.append(previousState.messages, attachmentMsg),
						isAgentUploading: false,
					}));
				});
			} else {
				this.setState(previousState => ({
					messages: GiftedChat.append(previousState.messages, botMessage),
					isAgentTyping: false,
				}));
			}

		} else if (messageType === 'useraction') {
			if(body === 'typing_start') {
				this.setState({
					isAgentTyping: true,
					agentName: from
				});
			} else if(body === 'typing_stop') {
				this.setState({
					isAgentTyping: false
				});
			}
		}  else if (messageType == 'terminate') {
			endChat(this.sessionId);
			this.props.navigation.navigate('Feedback', {data: {...this.state}});
		}
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
		botMessage.user.avatar =  null;

		const { fullName } = this.props.navigation.state.params.data;

		this.setState((previousState) => ({
			messages: GiftedChat.append(previousState.messages, [{ ...botMessage }])
		}));

		console.log('MESSAGE AT SEND = ' + JSON.stringify(botMessage, null, 2));
		const { image, text } = botMessage;
		if(text) {
			sendMessage({
				from: fullName,
				body: botMessage.text,
				messageType: 'chat'
			});
		} else if(image) {
			sendAttachment({
				...botMessage,
				from: fullName,
			});
		}

	}

	handleEmoticons(body) {
		const regex = /^(.*)<img .* src=\"\/system\/web\/view\/live\/agent\/reply\/\.\.\/\.\.\/\.\.\/\.\.\/common\/ckeditor\/plugins\/smiley\/images\/(.*)\.gif\" .*\/>(.*)$/g;
		const match = regex.exec(body);
		if(match) {
			const emoticonToReplace = this.getMatchingEmoticon(match[2]);
			return `${match[1]}${emoticonToReplace}${match[3]}`
		}
		return body;
	}

	getMatchingEmoticon(key) {
		const map = {
			regular_smile: '😀',
			sad_smile: '😫',
			wink_smile: '😉',
			teeth_smile: '😁',
			confused_smile: '😬',
			tounge_smile: '😛',
			embaressed_smile: '😳',
			omg_smile: '😲',
			whatchutalkingabout_smile: '😏',
			angry_smile: '😡',
			angel_smile: '😇',
			shades_smile: '😎',
			devil_smile: '😈',
			cry_smile: '😭',
			lightbulb: '💡',
			thumbs_down: '👎',
			thumbs_up: '👍',
			heart: '❤️',
			broken_heart: '💔',
			kiss: '💋',
			envelope: '✉️'
		}
		return map[key]
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

	// renderActions() {
	// 	return (
	// 		<Icon
	// 			name='plus-circle' 
	// 			size={60}
	// 			color='green'
	// 			onPress={this.launchImageBrowser.bind(this)}
	// 		/>
	// 	);
	// }

	// launchImageBrowser() {
	// 	const { ImagePickerManager } = NativeModules;
	// 	ImagePickerManager.showImagePicker({}, () => {});
	// }


	renderFooter(props) {
		const { isAgentTyping, isAgentUploading } = this.state;
		if (isAgentTyping || isAgentUploading) {
			return (
			<View style={s.footerContainer}>
				<Text style={s.footerText}>
				{`${this.state.agentName} is ${isAgentTyping ? 'typing' : 'uploading'}`}<AnimatedEllipsis animationDelay={150} style={s.ellipsis} />
				</Text>
			</View>
			);
		}
		return null;
	}

	  renderMessageText(props) {

		if (props.currentMessage.text) {
			const { ...messageTextProps } = props;
			const textColor = props.position === 'right' ? 'white' : 'black';
			messageTextProps.currentMessage.text = this._isHtml(props.currentMessage.text) ? <HTML html={props.currentMessage.text} baseFontStyle={{color: textColor, fontSize: 16}} /> : props.currentMessage.text;
			return <MessageText
			 {...messageTextProps} 
				textStyle={{
				left: { marginTop: 8,},
				right: { marginTop: 8, color: 'white'}
				}}
			 />;
		}
		return null;
	  }

	renderCustomActions(props) {
		if (Platform.OS === 'ios') {
			return (
			<CustomActions
				{...props}
			/>
			);
		}
		const options = {
			'Action 1': (props) => {
			alert('option 1');
			},
			'Action 2': (props) => {
			alert('option 2');
			},
			'Cancel': () => {},
		};
		return (
			<Actions
			{...props}
			options={options}
			/>
		);
	}

	_isHtml(str) {
		const regex = /<[a-z][\s\S]*>/i;
		const match = regex.exec(str);
		if(match) {
			return true;
		}
		return false;
	}

	render() {
		console.log('MESSAGES=', JSON.stringify(this.state.messages, null, 2));
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
							isAnimated={true}
							renderActions={this.renderCustomActions.bind(this)}
							renderSystemMessage={this.renderSystemMessage.bind(this)}
							renderFooter={this.renderFooter.bind(this)}
							renderMessageText={this.renderMessageText.bind(this)}
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

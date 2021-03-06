import * as SignalR from '@aspnet/signalr';
import moment from 'moment';
import RNFetchBlob from 'react-native-fetch-blob';
import GUID from 'uuid/v1';
import ClientInfo from './chat/ClientInfo';
import LoginParams from './chat/LoginParams';
import { postFeedback, reportChatBegin, reportStartSession, reportStopSession } from './service';


const SERVER_URL = 'https://bswegain.bswhealth.org/system';
const ENDPOINT = 1009;
const API_VERSION = 'v1';
const ENTRYPOINT = `${SERVER_URL}/egain/ws/${API_VERSION}/chat/entrypoint`;

const SIGNALR_URL = 'https://dgebdon.azurewebsites.net';
const SIGNALR_CHATHUB_URL = `${SIGNALR_URL}/chathub?chatSession=`
const SIGNALR_CALLBACK_URL = `${SIGNALR_URL}/api/message/egain?chatSession=`

const GET_INIT = `${SERVER_URL}/egain/chat/entrypoint/initialize/${ENDPOINT}`;
const GET_ATTACHMENT = `${ENTRYPOINT}/getAttachment`;

const POST_START = `${ENTRYPOINT}/start`;
const POST_SEND = `${ENTRYPOINT}/sendMessage`;
const POST_END = `${ENTRYPOINT}/end`;
const POST_ATTACHMENT_NOTIFICATION = `${ENTRYPOINT}/sendCustAttachmentNotification`;
const POST_UPLOAD_ATTACHMENT = `${ENTRYPOINT}/uploadAttachment`;
const POST_ACCEPT_ATTACHMENT = `${ENTRYPOINT}/acceptAttachment`;
const POST_REJECT_ATTACHMENT = `${ENTRYPOINT}/rejectAttachment`;

const PUT_UPDATE_CALLBACK = `${ENTRYPOINT}/updateCallback`;

let SESSION_ID = '';
let START_TIME = '  ';
let END_TIME = '';
let CHAT_BEGIN_TIME = '';
let pSessionId;


export function checkAgentAvailability() {
    // TODO Implement
    fetch()
    .then( res => res.json())
    .then( res => console.log('IN FETCH API', res));
}

export function setChatBeginTime() {
    CHAT_BEGIN_TIME = new Date();
    reportChatBegin(START_TIME, CHAT_BEGIN_TIME, pSessionId );
}

export function getStats() {

    return {
        sessionTime: moment(END_TIME).from(START_TIME, true),
        waitTime: CHAT_BEGIN_TIME ? moment(CHAT_BEGIN_TIME).from(START_TIME, true) : 'N/A'
    }
}

export function startChatHub(sessionId, onMessageReceived) {
    let connection = new SignalR.HubConnectionBuilder()
                        .withUrl(`${SIGNALR_CHATHUB_URL}${sessionId}`)
                        .configureLogging(SignalR.LogLevel.Information)
                        .build();
    
    
    connection.on('ReceiveMessage', (eGainChatSession, message) => { 
        onMessageReceived(message);
    });
    START_TIME = new Date();
    return connection.start()
        .then((data) => console.log('SUCCESS - Webscoket connection created', JSON.stringify(data, null, 2)))
        .catch((error) => console.log('UNABLE TO START WEBSOCKET', error));
}

export function endChat(sessionId = pSessionId) {
    let formBody = [];
    const encodedKey = encodeURIComponent('attachmentName');
    const encodedValue = encodeURIComponent('dummy');
    formBody.push(encodedKey + "=" + encodedValue);
    formBody = formBody.join("&");

    END_TIME = new Date();
    fetch(POST_END, {
        method: 'post',
        headers: {
            'Accept': 'application/json, application/xml',
            'Content-Type': 'application/json',
            'X-egain-chat-session': SESSION_ID,
        },
        body: _stringify({})
    })
    .then((response) => {
        print(response);
        if (response.ok) {
            return response;
        } else {
        let errorMessage = `${response.status} (${response.statusText})`,
            error = new Error(errorMessage);
        throw(error);
        }
    })
    .catch(error => {
        console.log('END CHAT FAILED', JSON.stringify(error, null, 2));
    })
    .finally(() => {
        reportStopSession(START_TIME, CHAT_BEGIN_TIME, END_TIME, sessionId );
    });
}

export function submitFeedback(data) {
    postFeedback(pSessionId, START_TIME, data);
}

export function startChat({name, email, phone, subject, accountNumber, region, sessionId}) {
    pSessionId = sessionId;
    
    const loginParams = new LoginParams()
                            .withName(name)
                            .withEmail(email)
                            .withPhone(phone)
                            .withSubject(subject)
                            .withAccountNumber(accountNumber)
                            .withRegion(region)
                            .build();
    const clientInfo = new ClientInfo()
                            .withCallbackURL(`${SIGNALR_CALLBACK_URL}${sessionId}`)
                            .build();
    const body = {
        entryPoint: ENDPOINT,
        languageCode: 'en',
        countryCode: 'US',
        loginParams: loginParams,
        clientInfo: clientInfo
      };

    return fetch(POST_START,{
        method: 'post',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache': 'no-cache'
        },
        body: _stringify(body)
    })
    .then(response => {
        print(response);
        if (response.ok) {
            return response;
        } else {
            const errorMessage = `${response.status} (${response.statusText})`;
            throw(new Error(errorMessage));
        }
    })
    .then(res => {
        //console.log('EXTRACTED SESSION ID=', res.headers.map[x-egain-chat-session][0]);
        //console.log('RESPONSE HEADERS=', JSON.stringify(res.headers.map['x-egain-chat-session'], null, 2));
        SESSION_ID = res.headers.map['x-egain-chat-session'][0];
        reportStartSession(sessionId);
        return res;
    })
    .catch(error => {
        console.log('START FAILED', JSON.stringify(error, null, 2));
    });
}

export function sendMessage(body) {
    console.log('GOT MESSAGE TO SEND=' + JSON.stringify(body, null, 2));
    fetch(POST_SEND,{
        method: 'post',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-egain-chat-session': SESSION_ID,
            'Cache': 'no-cache'
        },
        body: _stringify(body),
    })
    .then(print)
    .then(status)
    .catch(error => {
        console.log('SEND MESSAGE FAILED', JSON.stringify(error, null, 2));
    });
}

export function acceptAttachment(data) {
    console.log('ACCEPT ATTACHMENT=', JSON.stringify(data, null, 2));

    let formBody = [];
    const encodedKey = encodeURIComponent('attachmentName');
    const encodedValue = encodeURIComponent(data.attachmentName);
    formBody.push(encodedKey + "=" + encodedValue);
    formBody = formBody.join("&");


    return fetch(`${POST_ACCEPT_ATTACHMENT}/${data.attachmentId}`, {
        method: 'post',
        headers: {
            'Accept': 'application/json, application/xml',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-egain-chat-session': SESSION_ID
        },
        body: formBody
    })
    .then((response) => {
        print(response);
        if (response.ok) {
            return response;
        } else {
        let errorMessage = `${response.status} (${response.statusText})`,
            error = new Error(errorMessage);
        throw(error);
        }
    })
    .then(response => {
        console.log('CALLING GET ATTACHMENT');
        return getAttachment(data.attachmentId)
    })
    .catch(error => {
        console.log('ACCEPT ATTACHMENT FAILED', JSON.stringify(error, null, 2));
    });

}

export function getAttachment(attachmentId){
    console.log('IN GET ATTACHMENT');
    return fetch(`${GET_ATTACHMENT}/${attachmentId}`, {
        headers: {
            'Accept': 'application/json, application/xml',
            'X-egain-chat-session': SESSION_ID,
        },
    })
    .then(response => {
        print(response);
        if (response.ok) {
            return response;
        } else {
            const errorMessage = `${response.status} (${response.statusText})`;
            throw(new Error(errorMessage));
        }
    })
	.then(function(response) {
        return response.blob();
    })
    .then(function(imageBlob) {
        return URL.createObjectURL(imageBlob);
    })
    .catch(error => {
        console.log('ACCEPT GET FAILED', JSON.stringify(error, null, 2));
    })
}

export function sendAttachment(data) {
    const attachmentId = GUID();
    data.fileId = attachmentId;
    data.fileInternalName = `${attachmentId}_${data.fileName}`;

    RNFetchBlob.fs.stat(data.image)
    .then((stats) => {
        console.log('RNFETCH=', JSON.stringify(stats, null, 2));
        data.fileSize = stats.size;
        sendAttachmentNotification(data);
    })
    .catch((err) => {
        console.log('ERROR=RNFETCH=', JSON.stringify(err, null, 2));
    })


}

export function sendAttachmentNotification(data) {
    console.log('UPLOAD ATTACHMENT NOTIFICATION=', JSON.stringify(data, null, 2));
    const { fileInternalName, fileSize, fileId, fileName } = data;
    const payload = {
        fileInternalName,
        fileSize,
        fileId,
        fileName,
    };

    let formBody = [];
    for (const property in payload) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(payload[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch(POST_ATTACHMENT_NOTIFICATION, {
        method: 'post',
        credentials: 'include',
        headers: {
            'Accept': 'application/json, application/xml',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-egain-chat-session': SESSION_ID,
        },
        body: formBody,
    })
    .then(print)
    .then( (resp) => {
        uploadAttachment(data);
    })
    .catch(error => {
        console.log('ACCEPT ATTACHMENT NOTIFICATION FAILED', JSON.stringify(error, null, 2));
    });
}

export function uploadAttachment(data) {
    console.log('UPLOAD ATTACHMENT=', JSON.stringify(data, null, 2));
    const { fileId, fileInternalName, fileName, image } = data;



    // RNFetchBlob.fetch('POST', POST_UPLOAD_ATTACHMENT, { 
    //     'Content-Type' : 'multipart/form-data',
    //     'Accept': 'application/json, application/xml',
    //     'X-egain-chat-session': SESSION_ID
    // }, [
    //     { name : 'fileId', data : fileId },
    //     { name : fileInternalName, filename: fileName,  data: RNFetchBlob.wrap(data.image) }
    // ])
    // .then(this.print.bind(this))
    // .catch(error => {
    //     console.log('ACCEPT ATTACHMENT FAILED', JSON.stringify(error, null, 2));
    // });;


    RNFetchBlob.fs.readFile(image, 'base64')
    .then((imageBlob) => {
        console.log('IMAGE DATA=', JSON.stringify(imageBlob, null, 2));
        const formData = new FormData();
        formData.append('fileId', fileId);
        formData.append(fileInternalName, imageBlob, fileName);

        console.log('MULTI-PART', JSON.stringify(formData, null, 2));


        fetch(POST_UPLOAD_ATTACHMENT, {
            method: 'post',
            headers: {
                'Accept': 'application/json, application/xml',
                'Content-Type': 'multipart/form-data',
                'X-egain-chat-session': SESSION_ID,
            },
            body: formData,
        })
        .then(this.print.bind(this))
        .catch(error => {
            console.log('ACCEPT ATTACHMENT FAILED', JSON.stringify(error, null, 2));
        });
    })

    // const task = RNFetchBlob.fs.fetch('GET', data.image)

    // task.then((data) => {
    //     console.log('IMG DATA=', JSON.stringify(data, null, 2));
    // })
    // .catch((err) => {
    //     console.log(err)
    // });
}

function _stringify(body) {
    return JSON.stringify(body);
}

stringify = (body) => JSON.stringify(body);

json = (response) => response.json();

print = (response) => {
    console.log('RESPONSE=', JSON.stringify(response, null,2))
    return response;
}

status = (response) => {
    if(response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}


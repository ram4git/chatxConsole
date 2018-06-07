import firebase from './firebase';



export function reportStartSession(sessionId) {
    const date = new Date();
    const dateArray = date.toLocaleDateString().split('/');
    const month = dateArray[0];
    const day = dateArray[1];

    const updates = {};
    const postData = {
        startTime: date,
    }
    
    console.log('XXXX');
    updates[`/${month}/${day}/active/${sessionId}`] = postData;
    firebase.database().ref('sessions').update(updates);
    console.log('YYYY');

} 

export function reportStopSession(startTime, chatBeginTime, endTime, sessionId) {
    const dateArray = startTime.toLocaleDateString().split('/');
    const month = dateArray[0];
    const day = dateArray[1];
    const updates = {};
    const postData = {
        startTime,
        chatBeginTime,
        endTime
    };
    
    console.log('XXXX');
    updates[`/${month}/${day}/active/${sessionId}`] = null;
    updates[`/${month}/${day}/finished/${sessionId}`] = postData;
    firebase.database().ref('sessions').update(updates);
    console.log('YYYY');
}

export function postFeedback(sessionId, startTime, feedback) {
    const dateArray = startTime.toLocaleDateString().split('/');
    const month = dateArray[0];
    const day = dateArray[1];
    const updates = {};

    console.log('XXXX');
    if(feedback.rating1) {
        updates[`/${month}/${day}/finished/${sessionId}/rating1`] = feedback.rating1;
    }
    if(feedback.rating2) {
        updates[`/${month}/${day}/finished/${sessionId}/rating2`] = feedback.rating2;        
    }
    if(feedback.rating3) {
        updates[`/${month}/${day}/finished/${sessionId}/rating3`] = feedback.rating3;        
    }
    if(feedback.msg) {
        updates[`/${month}/${day}/finished/${sessionId}/feedback`] = feedback.msg;        
    }

    firebase.database().ref('sessions').update(updates);
    console.log('YYYY');
}

export function reportChatBegin(startTime, chatBeginTime, sessionId) {
    const dateArray = startTime.toLocaleDateString().split('/');
    const month = dateArray[0];
    const day = dateArray[1];
    const updates = {};
    updates[`/${month}/${day}/active/${sessionId}/chatBeginTime:`] = chatBeginTime;
    firebase.database().ref('sessions').update(updates);
}
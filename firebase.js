import * as firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAyxX4ANmjW-_CwIB8DUE3MA48WwkkRq5Q",
    authDomain: "chatx-1fd35.firebaseapp.com",
    databaseURL: "https://chatx-1fd35.firebaseio.com",
    projectId: "chatx-1fd35",
    storageBucket: "chatx-1fd35.appspot.com",
    messagingSenderId: "857041143350"
  };
firebase.initializeApp(config);

export default firebase;
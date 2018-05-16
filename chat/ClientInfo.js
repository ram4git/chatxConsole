export default class ClientInfo {
    constructor() {
        this.name = 'BSW4SIGNALR',
        this.referrerName = 'BSW_APP_USER_IDENTIFIER'
        this.referrerURL = 'BSW_APP_ID_URL_CHANGE_LATER'
        this.clientCallback = {
            messageFormat: 'json'
        }
    }

    withName(name) {
        this.name = name;
        return this;
    }

    withReferrerName(referrerName) {
        this.referrerName = referrerName;
        return this;
    }

    withReferrerURL(referrerURL) {
        this.referrerURL = referrerURL;
        return this;
    }

    withMessageFormat(format) {
        this.clientCallback[messageFormat] = format;
        return this;
    }

    withCallbackURL(callbackURL) {
        this.clientCallback['callbackURL'] = callbackURL;
        return this;
    }

    setCallbackURL(callbackURL) {
        this.clientCallback['callbackURL'] = callbackURL;
    }

    build() {
        return this;
    }

}

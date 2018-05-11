export default class LoginParams {
    constructor() {
        this.params = [];
    }

    withName(name) {
        this.params.push({
            'paramName': 'full_name',
            'paramValue': name,
            'isPrimary': false
        });
        return this;
    }

    withEmail(email) {
        this.params.push({
            'paramName': 'email_address',
            'paramValue': email,
            'isPrimary': true
        });
        return this;
    }

    withPhone(phone) {
        this.params.push({
            'paramName': 'phone_number',
            'paramValue': phone,
            'isPrimary': false
        });
        return this;
    }

    withSubject(subject) {
        this.params.push({
            'paramName': 'subject',
            'paramValue': subject,
            'isPrimary': false
        });
        return this;
    }

    withAccountNumber(accountNumber) {
        this.params.push({
            'paramName': 'custom.activitydata.account_number',
            'paramValue': accountNumber,
            'isPrimary': false
        });
        return this;
    }

    withRegion(region = 'US') {
        this.params.push({
            'paramName': 'custom.activitydata.region',
            'paramValue': region,
            'isPrimary': false
        });
        return this;
    }
    build() {
        return this.params;
    }
}
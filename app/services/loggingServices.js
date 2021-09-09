'use strict';
const request = require('request-promise');
const nconf = require('nconf');
const constant = require('../constant/constant');

class loggingService {
    constructor() {
        this.logChannelType = constant.LOG_CHANNEL_TYPE;
        this.logType = constant.LOG_TYPE;
        this.isLogEnabled = nconf.get('LoggingService').IsEnabled;
        this.logUrl = nconf.get('LoggingService').Url;
        this.logMode = nconf.get('LoggingService').Mode;
        this.timeOut = nconf.get('LoggingService').Timeout;
    }

    async logAsync(category, source, message, params) {
        try {
            if (this.isLogEnabled) {
                let errorMessage = null;
                if (message.hasOwnProperty('message')) {
                    errorMessage = { message: message.message };
                }

                if (message.hasOwnProperty('stack')) {
                    errorMessage['stack'] = message.stack;
                }

                if (errorMessage === null) {
                    errorMessage = message;
                }

                let logMessage = {
                    messagesource: source,
                    message: JSON.stringify(errorMessage),
                    logdatetime: new Date(),
                    parameters: JSON.stringify(params)
                }

                var jsonData = {
                    service: this.logChannelType,
                    type: this.logType,
                    category: category,
                    message: logMessage
                }

                if (this.logMode == "both" || this.logMode == "console") {
                    console.log(jsonData);
                }

                if (this.logMode != "console") {
                    await request.post({ uri: this.logUrl, json: jsonData, timeout: this.timeOut });
                }
            }
        } catch (ex) {
            console.log(ex);
        }
    }

    async logErrorAsync(source, message, params) {
        await this.logAsync(constant.LOG_ERROR_CATEGORY, source, message, params);
    }

    async logInfoAsync(source, message, params) {
        await this.logAsync(constant.LOG_INFO_CATEGORY, source, message, params);
    }

    async logTransAsync(source, message, params) {
        await this.logAsync(constant.LOG_TRANS_CATEGORY, source, message, params);
    }

    async logDBAsync(query) {
        await this.logAsync(constant.LOG_DB_CATEGORY, 'Sequelize', query, null);
    }
}

module.exports = loggingService;
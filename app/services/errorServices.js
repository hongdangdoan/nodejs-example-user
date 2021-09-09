const constants = require('../constant/constant.js');

class errorService {
    constructor() {}

    getMessage(errorCode, errorType, languageId) {
        // Exception will be thrown if the ErrorCode + LanguageId combination is not found
        // Catch this exception and proceed to get the defaut error message
        var message;
        try {
            try {
                message = constants.ErrorConfiguration[errorType][errorCode][languageId];
            } catch (ex) {
                message = constants.ErrorConfiguration[constants.ERROR_TYPE.API][errorCode][constants.DEFAULT_LANGUAGEID];
            }
        } catch (ex) {
            message = constants.ErrorConfiguration[constants.ERROR_TYPE.API][constants.DEFAULT_ERROR_CODE][languageId];
        }



        return message;
    }
}

module.exports = errorService;
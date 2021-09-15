const responseDto = require("../dto/responseDTO");
const constants = require("../constant/constant");
const violationDto = require("../dto/violationDTO");
const errorService = require('../services/errorServices');
const apiError = require('../dto/apiError');


module.exports = function (req, res, next) {
    let errService = new errorService();

    res.sendErrorStatus = function (status, err, languageId = 'en-US') {

        var message = err;
        var violations = [];

        if (err instanceof apiError) {
            message = errService.getMessage(err.errorCode, err.errorType, languageId);

            if (message) {
                violations.push(new violationDto(
                    err.errorCode,
                    message
                ));
            }
        }

        if (violations.length == 0) {
            violations.push(new violationDto(
                constants.DEFAULT_ERROR_CODE,
                errService.getMessage(constants.DEFAULT_ERROR_CODE, constants.ERROR_TYPE.API, languageId)
            ));
        }
        res.status(status).send(new responseDto(null, message, violations));
    }

    res.sendError = function (err, languageId = 'en-US') {

        var message = err;
        var violations = [];

        if (err instanceof apiError) {
            message = errService.getMessage(err.errorCode, err.errorType, languageId);

            if (message) {
                violations.push(new violationDto(
                    err.errorCode,
                    message
                ));
            }
        }

        if (violations.length == 0) {
            violations.push(new violationDto(
                constants.DEFAULT_ERROR_CODE,
                errService.getMessage(constants.DEFAULT_ERROR_CODE, constants.ERROR_TYPE.API, languageId)
            ));
        }
        res.send(new responseDto(null, message, violations));
    }

    res.sendOk = function (data) {
        res.send(new responseDto(data));
    }

    next()
}
class violationDto {
    constructor(code, message, action = null) {
        this.code = code;
        this.message = message;
        this.action = action;
    }
}

module.exports = violationDto;
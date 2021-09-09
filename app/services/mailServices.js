"use strict";
const nodemailer = require("nodemailer");
var nconf = require('nconf');
const mailDTO = require("../dto/mailDTO");

// async..await is not allowed in global scope, must use a wrapper
class mailServices {
    constructor() {
        if (!this.transporter)
            this.transporter = nodemailer.createTransport(nconf.get("smtpOptions"));

    }

    async replaceMailTemplate(sHtml, oReplace) {
        let sReturn = sHtml;
        for (let i = 0; i < oReplace.length; i++) {
            sReturn = sReturn.replace(oReplace[i].replace, oReplace[i].textReplace);
        }
        return sReturn;
    }

    async sendmail(mailOptions) {
        return this.transporter.sendMail(mailOptions);
    }
}


module.exports = mailServices;
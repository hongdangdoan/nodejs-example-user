class mailDTO {
    constructor(from, to, subject, html) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.html = html;
    }
}

module.exports = mailDTO;
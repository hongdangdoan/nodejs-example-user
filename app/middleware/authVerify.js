const jwt = require("jsonwebtoken")
var nconf = require('nconf');

module.exports = function (req, res, next) {
    const bearerHeader = req.header("Authorization");

    try {
        const bearer = bearerHeader.split(' ');       
        const token = bearer[1];
        if (!token)
            return res.sendError("Not authorization", req.headers.languageid);

        const verified = jwt.verify(token, nconf.get("JWT:Secret"));
        req.user = verified;
        next();
    }
    catch (err) {
        res.sendErrorStatus(401, "Invalid token", req.headers.languageid);
    }
}
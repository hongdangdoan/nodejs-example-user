'use strict'
require('dotenv').config({ path: '.env' });


const express = require('express')
var nconf = require('nconf');
var cors = require('cors');
var bodyParser = require('body-parser');
const { v4: uuid_v4 } = require('uuid');

nconf.argv()
    .env()
    .file({ file: './app/config/' + "development" + '.json' });


var port = nconf.get("Port");
var app = express();


app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json({ type: "application/json" }));

app.use(function (req, res, next) {
    if (req.headers.request_id === undefined || req.headers.request_id === null) {
        req.id = uuid_v4();
    } else {
        req.id = req.headers.request_id;
    }
    next();
});

/**
 * MIDDLEWARE
 **/


app.listen(port, function () {
    console.log("Server listen on port: " + port);
})

/** 
 * SWAGGER
 **/
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
var constant = require('./app/constant/constant');
app.use('/' + constant.SWAGGER_ROUTER, swaggerUi.serve, swaggerUi.setup(swaggerFile))
require('./endpoints')(app)
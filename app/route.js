'use strict';
//const loggingWrapper = require('./middleware/loggingwrapper');
const constant = require('./constant/constant');
const apiControllerPath = './controllers';
var changeCase = require('change-case');
var express = require('express');
var requireDir = require('require-dir')
var fs = require('fs');
var path = require('path');
var Routes = function(app) {

    var prefix = constant.ROUTE_PREFIX;
    // Configure API controller paths
    fs.readdirSync(path.resolve(__dirname, apiControllerPath)).forEach(dir => {
        var fullPath = path.join(apiControllerPath, dir);
        var routes = requireDir(fullPath);

        Object.keys(routes).forEach(function(routeName) {
            var router = express.Router();

            var DynamicController = require("./" + path.join(fullPath, routeName));
            var controller = new DynamicController();

            controller.init(router);

            // Indicate if logging of request and response is required
            // if (!controller.hasOwnProperty('DisableLogging') || !controller.DisableLogging) {
            //     app.use('/' + prefix + '/api/' + dir + '/' + changeCase.paramCase(routeName), new loggingWrapper().logTransaction);
            // }
            console.log('/' + prefix +'/'+ dir + '/' + changeCase.paramCase(routeName))
            app.use('/' + prefix + '/' + dir + '/' + changeCase.paramCase(routeName), router);
        });
    });

}

module.exports = Routes;
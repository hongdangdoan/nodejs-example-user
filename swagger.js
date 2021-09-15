
const result = require('dotenv').config({ path: '.env' });

const swaggerAutogen = require("swagger-autogen")();
const outputFile = "./swagger_output.json";
const endpointsFiles = []; //['./endpoints.js']
const apiControllerPath = "./app/controllers";
var fs = require("fs");
var path = require("path");
var requireDir = require("require-dir");
var nconf = require('nconf');

console.log(result.parsed['NODE_ENV']);

nconf.argv()
  .env()
  .file({ file: './app/config/' + result.parsed['NODE_ENV'] + '.json' });
console.log('./app/config/' + result.parsed['NODE_ENV'] + '.json')

// Configure API controller paths
fs.readdirSync(path.resolve(__dirname, apiControllerPath)).forEach((dir) => {
  var fullPath = path.join(apiControllerPath, dir);
  var routes = requireDir(fullPath);

  Object.keys(routes).forEach(function (routeName) {
    let dir_router = "./" + path.join(fullPath, routeName) + ".js";
    endpointsFiles.push(dir_router);
  });
});

const doc = {
  info: {
    version: "1.0.0",
    title: "center API",
    description: "Coder by Hong Dang",
  },
  host: "localhost:3001",
  basePath: "/api/v1.0/",
  schemes: [], // by default: ['http']
  consumes: [], // by default: ['application/json']
  produces: [], // by default: ['application/json']
  tags: [
    {
      name: "nodejs example",
      description: "nodejs example",
    },
  ],
  securityDefinitions: {
    Bearer: {
      name: "Authorization",
      in: "header",
      type: "apiKey",
    },
    Language: {
      name: "LanguageCode",
      in: "header",
      type: "apiKey",
    },
  },
  definitions: {
    Parents: {
      father: "Simon Doe",
      mother: "Marie Doe",
    },
    User: {
      name: "Jhon Doe",
      age: 29,
      parents: {
        $ref: "#/definitions/Parents",
      },
      diplomas: [
        {
          school: "XYZ University",
          year: 2020,
          completed: true,
          internship: {
            hours: 290,
            location: "XYZ Company",
          },
        },
      ],
    },
    authenticaion: {
      $Name: "Nguyen Van D",
      $Email: "nvd@gmail.com",
      $Password: "123456",
      $RePassword: "123456",
    },
    userActive: {
      $userID: "611c53f5-84c0-4911-a511-ef0279a4bbd9",
    },
    forgetPassword: {
      $email: "nvd246@gmail.com",
    },
    login: {
      $email: "nguyenvana@gmail.com",
      $password: "123456",
    },
    createNewPassword: {
      $code: "6AHfsQbHA39u9BIe4Jti",
    },
    updateMyInfo: {
      $OldEmail: "nguyenvana@gmail.com",
      $OldName: "nguyen van a",
      $NewEmail: "nguyenvana@gmail.com",
      $NewName: "nguyen van a",
      $NewPassword: "123456",
      $NewRePassword: "123456"
    }

  }
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index.js");

});

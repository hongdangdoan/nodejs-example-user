const CLASS_NAME = "user.userController";
const UserProvider = require("../../providers/userProvider");
const LoggingService = require("../../services/loggingServices");
const helperServices = require("../../services/helperServices");
const constant = require("../../constant/constant");
var nconf = require("nconf");
const jwt = require("jsonwebtoken");
const verify = require("../../middleware/authVerify");
const { validate } = require("../../services/validatorServices");
const { validationResult } = require("express-validator");
const AuthDTO = require("../../dto/authDTO");

class userController {
    constructor() {
        this.userProvider = new UserProvider();
        this.loggingServices = new LoggingService();
    }
    init(router) {
        const self = this;

        //define route

        router
            .route("/register")
            .all(validate.validateRegisterUser())
            .post(async function (req, res, next) {
                /*
                                            #swagger.path = '/user/register' 
                                            #swagger.tags = ['User']
                                            #swagger.description = 'Endpoint to get token with username & password' */
                /*	#swagger.parameters['obj'] = {
                                                in: 'body',
                                                description: 'User name + password',
                                                required: true,
                                                type: 'object',
                                                schema: { $ref: "#/definitions/authenticaion" }
                                            } 
                                            #swagger.security = [{
                                                Bearer: [],
                                                LanguageCode: []
                                            }] 
                                        */

                await self.register(req, res);
            })

        router
            .route("/login")
            .all(validate.validateLogin())
            .post(async function (req, res, next) {
                /*
                                          #swagger.path = '/user/login' 
                                          #swagger.tags = ['User']
                                          #swagger.description = 'Endpoint to get token with username & password' */
                /*	#swagger.parameters['obj'] = {
                                                in: 'body',
                                                description: 'User name + password',
                                                required: true,
                                                type: 'object',
                                                schema: { $ref: "#/definitions/login" }
                                            } 
                                            #swagger.security = [{
                                                Bearer: [],
                                                LanguageCode: []
                                            }] 
                                        */

                await self.login(req, res, next);

            });


        router
            .route("/getListUser")
            .get(async function (req, res, next) {

                /*
                                            #swagger.path = '/user/getListUser' 
                                            #swagger.tags = ['User']
                                            #swagger.description = 'Endpoint to get token with username & password' */
                /*	
                                            #swagger.security = [{
                                                Bearer: [],
                                                LanguageCode: []
                                            }] 
                                        */

                await self.getAllUser(req, res, next);

            });
    }

    //function to execute
    async register(req, res, next) {
        const self = this;
        const METHOD_NAME = "register";
        const SOURCE = `${CLASS_NAME}.${METHOD_NAME}`;

        //Validate model
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var mess = "";
            errors.array().forEach((element) => {
                if (mess) {
                    mess += " | " + element.msg;
                } else {
                    mess += element.msg;
                }
            });
            return res.sendError(mess, req.headers.languageid);
        }

        if (req.body.Password != req.body.RePassword)
            return res.sendError(
                "2 mật khẩu không giống nhau",
                req.headers.languageid
            );

        //Do function
        const emailExist = await self.userProvider.getUserByEmail(req.body.Email);
        if (emailExist) {
            return res.sendError("Tài khoản đã tồn tại", req.headers.languageid);
        }
        //Create user
        const passwordHash = await self.userProvider.hashPassword(
            req.body.Password
        );

        var userNew = {
            name: req.body.Name,
            email: req.body.Email,
            password: passwordHash,
            created_at: new Date(),

        };
        try {
            const resultCreate = await self.userProvider.createNewUser(userNew);
            if (resultCreate) {
                return res.sendOk({
                    message: "Đăng ký tài khoản thành công"
                });

            }
        } catch (ex) {
            console.log("Error while running register function: " + ex);

        }



        return await res.sendError("Somethings happen", req.headers.LanguageCode);
    }



    async login(req, res, next) {
        const self = this;
        const METHOD_NAME = "login";
        const SOURCE = `${CLASS_NAME}.${METHOD_NAME}`;

        //Validate model
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            var mess = "";
            errors.array().forEach((element) => {
                if (mess) {
                    mess += " | " + element.msg;
                } else {
                    mess += element.msg;
                }
            });
            return res.sendError(mess, req.headers.languageid);
        }

        const user = await self.userProvider.getUserByEmail(req.body.email);
        if (!user)
            return res.sendError("Email không hợp lệ!", req.headers.languageid);

        const validPassword = await self.userProvider.comparePassword(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.sendError("Mật khẩu không chính xác!", req.headers.languageid);

        try {
            //Access token
            const token = jwt.sign({ id: user.id }, nconf.get("JWT:Secret"), {
                expiresIn: nconf.get("JWT:tokenLife"),
            });
            //Refresh token
            const refreshToken = jwt.sign(
                { id: user.id },
                nconf.get("JWT:refreshTokenSecret"),
                { expiresIn: nconf.get("JWT:refreshTokenLife") }
            );
            //Save refreshToken DB
            await self.userProvider.updateRefreshToken(user.email, refreshToken);
            var responseModel = new AuthDTO();
            responseModel = {
                accessToken: token,
                refreshToken: refreshToken,
                expiresIn: nconf.get("JWT:refreshTokenLife"),
            };

            return await res.sendOk(responseModel);
        } catch (error) {
            console.log(error);
            return res.sendError(error, req.headers.languageid);
        }
    }

    async getAllUser(req, res, next) {
        const self = this;
        const METHOD_NAME = "getAllUser";
        const SOURCE = `${CLASS_NAME}.${METHOD_NAME}`;

        const lstUser = await this.userProvider.getAllUser();
        if (!lstUser) return res.sendError("Exception", req.headers.languageid);
        return await res.sendOk(lstUser);
    }

    async getMeData(req, res, next) {
        const self = this;
        const METHOD_NAME = "getMeData";
        const SOURCE = `${CLASS_NAME}.${METHOD_NAME}`;

        const lstUser = await this.userProvider.getUserByID(req.user.id);
        if (!lstUser) return res.sendError("Exception", req.headers.languageid);
        return await res.sendOk(lstUser);
    }
}

module.exports = userController;

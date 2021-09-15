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
const { constantCase } = require("constant-case");
const { selectFields } = require("express-validator/src/select-fields");

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
                                            #swagger.description = 'Endpoint to register' 
                */
                /*	#swagger.parameters['obj']= 
                                        {
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
                                          #swagger.description = 'Endpoint to get token with username & password'
                 */
                /*	#swagger.parameters['obj']=
                                           {
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
                                            #swagger.description = 'Endpoint to get list user do not use pagging' */
                /*	
                                            #swagger.security = [{
                                                Bearer: [],
                                                LanguageCode: []
                                            }] 
                */

                await self.getAllUser(req, res, next);

            });

        router
            .route("/getListUserOnPage/")
            .get(async function (req, res, next) {
                /*
                                                        #swagger.path = '/user/getListUserOnPage' 
                                                        #swagger.tags = ['User']
                                                        #swagger.description = 'Endpoint to get list of user using pagging' 
                */
                /*	#swagger.parameters['pageSize']=
                                        {
                                            name: 'pageSize',
                                            in: 'query',
                                            name: 'pageSize',
                                            required: false,
                                            type: 'integer'
                                         }
                    #swagger.parameters['currentPage']=
                                        {
                                           name: 'currentPage',
                                           in: 'query',
                                           name: 'currentPage',
                                           required: false,
                                           type: 'integer'
                                         }
                        
                                            #swagger.security = [{
                                                Bearer: [],
                                                LanguageCode: []
                                            }] 
                    */
                await self.getListUserOnPage(req, res, next);
            });

        router
            .route("/getMyInfo")
            .all(verify)
            .get(async function (req, res, next) {
                /*
                                                #swagger.path = '/user/getMyInfo' 
                                                #swagger.tags = ['User']
                                                #swagger.description = 'Endpoint to get my info'
                 */
                /* 
                                               #swagger.security = [{
                                                   Bearer: [],
                                                   LanguageCode: []   
                                               }] 
                */

                await self.getMyInfo(req, res, next);


            });

        router
            .route("/updateMyInfo")
            .all(verify)
            .post(async function (req, res, next) {
                /*
                                          #swagger.path = '/user/updateMyInfo' 
                                          #swagger.tags = ['User']
                                          #swagger.description = 'Endpoint to update my info: provide:oldName, oldEmail' */
                /*	
                    #swagger.parameters['new information']= 
                                           {
                                                in: 'body',
                                                description: 'New information ',
                                                required: true,
                                                type: 'object',
                                                schema: { $ref: "#/definitions/updateMyInfo" }
                                            } 
                                            #swagger.security = [{
                                                Bearer: [],
                                                LanguageCode: []
                                            }] 
                 */


                await self.updateMyInfo(req, res, next);
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
            const token = jwt.sign({ email: user.email }, nconf.get("JWT:Secret"), {
                expiresIn: nconf.get("JWT:tokenLife"),
            });
            //Refresh token
            const refreshToken = jwt.sign(
                { email: user.email },
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

    async getListUserOnPage(req, res, next) {
        const self = this;
        const METHOD_NAME = "getAllUserWithPagging";
        const SOURCE = `${CLASS_NAME}.${METHOD_NAME}`;
        var pageSize = parseInt(req.query.pageSize);
        var currentPage = parseInt(req.query.currentPage);
        const lstUser = await this.userProvider.getAllUserWithPagging(pageSize, currentPage);
        return await res.sendOk({
            data: lstUser.rows,
            totalPage: Math.ceil(lstUser.count / constant.PER_PAGE_RESULT),
            currentPage: currentPage
        });
    }

    async getMyInfo(req, res, next) {
        const self = this;
        const METHOD_NAME = "getMyInfo";
        const SOURCE = `${CLASS_NAME}.${METHOD_NAME}`;
        const result = await this.userProvider.getUserByEmail(req.user.email);
        return await res.sendOk(result);
    }

    async updateMyInfo(req, res, next) {
        const self = this;
        const METHOD_NAME = "updateMyInfo";
        const SOURCE = `${CLASS_NAME}.${METHOD_NAME}`;

        console.log("show data: ");
        console.log(req.user.email);
        console.log(req.body.OldEmail);
        if (req.user.email != req.body.OldEmail) {

            return await res.sendError("Dữ liệu không hợp lệ", req.headers.languageid);
        }
        const user = await this.userProvider.getUserByEmail(req.user.email);
        console.log(user.name);
        if (user.name != req.body.OldName) {
            return await res.sendError("Dữ liệu không hợp lệ", req.headers.languageid);
        }
        else {
            if (req.body.NewName != null) {
                console.log("update name");
                try {
                    const resultCreate = await self.userProvider.updateUserName(req.user.email, req.body.NewName);
                } catch (ex) {
                    console.log("Error while running update function: " + ex);
                    return res.sendError({
                        message: "Lỗi cập nhật thông tin"
                    });

                }
            }

            if (req.body.NewPassword != null) {
                if (req.body.NewPassword != req.body.NewRePassword)
                    return res.sendError(
                        "2 mật khẩu không giống nhau",
                        req.headers.languageid
                    );
                const passwordHash = await self.userProvider.hashPassword(
                    req.body.NewPassword
                );
                try {
                    console.log("update password");
                    const resultCreate = await self.userProvider.updateUserPassword(req.user.email, passwordHash);

                } catch (ex) {
                    console.log("Error while running update function: " + ex);
                    return res.sendError({
                        message: "Lỗi cập nhật thông tin"
                    });
                }
            }
            if (req.body.NewEmail != null) {
                const emailExist = await self.userProvider.getUserByEmail(req.body.NewEmail);
                if (emailExist) {
                    return res.sendError("Tài khoản đã tồn tại", req.headers.languageid);
                }
                try {
                    const resultCreate = await self.userProvider.updateUserEmail(req.user.email, req.body.NewEmail);

                } catch (ex) {
                    console.log("Error while running update function: " + ex);
                    return res.sendError({
                        message: "Lỗi cập nhật thông tin"
                    });
                }
                console.log("update email");
            }

            return res.sendOk({
                message: "Cập nhật thông tin thành công"
            });
        }

    }
}

module.exports = userController;

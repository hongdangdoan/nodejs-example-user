const { check, body } = require("express-validator");

let validateRegisterUser = () => {
  return [
    check("Name","Name không được để trống").not().isEmpty(),
    check("Email", "Email không được để trống").not().isEmpty(),
    check("Email", "Email không hợp lệ").isEmail(),
    check("Password", "Mật khẩu không được để trống").not().isEmpty(),
    check("Password", "Mật khẩu ít nhất 6 ký tự").isLength({ min: 6 }),
    check("Password", "Mật khẩu tối đa 19 ký tự").isLength({ max: 19 }),

    check("RePassword")
      .isLength({ min: 1 })
      .withMessage("Xác nhận mật khẩu bắt buộc nhập"),

  ];
};

let validateLogin = () => {
  return [
    check("email", "Email không được để trống").not().isEmpty(),
    check("email", "Email không hợp lệ").isEmail(),
    check("password", "Mật khẩu không được để trống").not().isEmpty(),
    check("password", "Mật khẩu ít nhất 6 ký tự").isLength({ min: 6 }),
    check("password", "Mật khẩu tối đa 19 ký tự").isLength({ max: 19 }),
  ];
};

let validateForgetPassword = () => {
  return [
    check("email", "Email không được để trống").not().isEmpty(),
    check("email", "Email không hợp lệ").isEmail(),
    check("email", "Email ít nhất 3 ký tự").isLength({ min: 3 }),
    check("email", "Email tối đa 50 ký tự").isLength({ max: 50 }),
  ];
};

let validate = {
  validateRegisterUser: validateRegisterUser,
  validateLogin: validateLogin,
  validateForgetPassword: validateForgetPassword,
};

module.exports = { validate };

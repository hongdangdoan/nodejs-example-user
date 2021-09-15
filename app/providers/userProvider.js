"use strict";

const Op = require("sequelize").Op;
const apiError = require("../dto/apiError");
const bcrypt = require("bcryptjs");
const helperServices = require("../services/helperServices");
const constant = require("../constant/constant");
var nconf = require("nconf");

var initModels = require("../models/init-models");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(nconf.get("Database:DB_DATABASE"), nconf.get("Database:DB_USER"), nconf.get("Database:DB_PASS"), {
  host: nconf.get("Database:DB_HOST"),
  port: nconf.get("Database:DB_PORT"),
  dialect: 'mysql',
  operatorsAliases: 0
});

class userProvider {
  constructor(skipInitDb) {
    if (skipInitDb === true) {
      this.db = {};
    } else {
      this.db = initModels(sequelize);
    }
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hashSync(password.toString(), salt);
  }

  async comparePassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }

  async getAllUser() {
    const self = this;
    try {
      var result = await self.db.user.findAll();
      return result;
    } catch (ex) {
      throw ex;
    }
  }

  async getAllUserWithPagging( pageSize,  currentPage) {
    const self = this;
    try {
      var result = await self.db.user.findAndCountAll({
        offset: (currentPage-1)*constant.PER_PAGE_RESULT,
        limit:pageSize
        
      });
      return result;
    } catch (ex) {
      throw ex;
    }
  }


  async getUserByEmail(Email) {
    const self = this;
    try {
      var result = await self.db.user.findOne({ where: { email: Email } });
      return result;
    } catch (ex) {
      console.log("Error when run function findOne: " + ex)
      throw new apiError(99, ex);
    }
  }

  async createNewUser(userNew) {
    const self = this;

    try {
      var result = await self.db.user.create(userNew);
      if (!result) throw new apiError(100, "Đã xảy ra lỗi khi tạo user");
      return result;
    } catch (ex) {
      throw new apiError(99, ex);
    }
  }

  async deleteUser(email) {
    const self = this;

    try {
      return await self.db.user.destroy({
        where: {
          email: email,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error(`Unable to connect to the database.`);
    }
  }



  async updateUserPassword(email, password) {
    const self = this;

    try {
      return await self.db.user
        .update({ password: password }, { where: { email: email } })
        .then((result) => {
          return true;
        })
        .catch((err) => {
          return false;
        });
    } catch (error) {
      console.log(error);
      throw new Error(`Unable to connect to the database.`);
    }
  }

  async updateRefreshToken(email, refreshToken) {
    const self = this;
    var today = new Date();
    try {
      return await self.db.user
        .update(
          {
            refreshToken: refreshToken,
            updatedAt: today,
            tokenExpireTime: helperServices.addSeconds(
              new Date(),
              nconf.get("JWT:refreshTokenLife")
            ),
          },
          { where: { email: email } }
        )
        .then((result) => {
          return true;
        })
        .catch((err) => {
          return false;
        });
    } catch (error) {
      console.log(error);
      throw new Error(`Unable to connect to the database.`);
    }
  }
}

module.exports = userProvider;

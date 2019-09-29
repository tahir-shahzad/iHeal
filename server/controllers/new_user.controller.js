const userSchema = require("../models").user;
const bcrypt = require('bcryptjs')
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
var config = require(__dirname + "/../config/config.json")[env];
var sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
const ActivityLog = require("../models").activityLog;
const password = require("../utilities/password.utility");
const userClinicSchema = require("../models").userClinic;
const clinic = require("../models").clinic;
userClinicSchema.belongsTo(userSchema, {
  foreignKey: "userid"
});
userClinicSchema.belongsTo(clinic, {
  foreignKey: "clinicid"
});

// Creating user if session user is Admin or SuperAdmin.
exports.createUser = (req, res) => {
  let activity = "Create User Log"
  let user = req.session.userId;
  if (
    req.session.userId &&
    (req.session.userType == "superAdmin" || req.session.userType == "Admin")
  ) {
    //do nothing
  } else {
    return res.status(200).send({
      success: false,
      message: "You dont have access to create new users"
    });
  }
  let thisPassword = password.createPassword();

  // FIXME with infinite str
  let genUsername = Math.random()
    .toString(36)
    .substr(7);

  let userData;
  userSchema
    .create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: genUsername,
      email: req.body.email,
      userType: req.body.userType,
      mobileNumber: req.body.mobileNumber,
      locationRestriction: req.body.locationRestriction,
      password: thisPassword.encryptedString,
      quickBlockID: thisPassword.decryptedString,
      createrId: req.session.userId
    })
    .then(data => {
      userData = data;
      // console.log("----------newuser data-id-----------------");
      // console.log(data.id);
      if (
        req.body.clinicid instanceof Array &&
        req.body.clinicid.length !== 0
      ) {

        req.body.clinicid.forEach(element => {
          userClinicSchema
            .create({
              clinicid: element,
              userid: data.id
            })
            .catch(err => {
              return res.status(200).send({
                success: false,
                message: err.message
              });
            });
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "cannot find clinicid, clinicid must be an array"
        });
      }
    })
    .then(() => {
      // Create Activity Log when user is created.
      createDeleteLog(req, res, user, activity);
      delete userData.password;
      return res.status(200).send({
        success: true,
        user: userData,
        message: "user and clinicid created successfully"
      });
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

// Get All Super Admin User
function getAllSuperAdmin(req, res) {
  sequelize
    .query(
      'select cl.clinicname ,cl.id as clinicid ,u.id as id ,u.username,u."mobileNumber",u.email, u."firstName" ,u."lastName",u.status, u."userType" from "userClinics" uc join users u on u.id = uc.userid join clinics cl on cl.id = uc.clinicid order by cl.clinicname;',
      {
        model: userSchema
      }
    )
    .then(data => {
      if (!data.length) {
        return res.status(200).send({
          success: false,
          message: "user not found"
        });
      } else {
        return res.status(200).send({
          success: true,
          total_records: data.length,
          data: data
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    }); //userSchema.findAll
}

// Get All Admin user.
function getAllAdmin(req, res) {
  userSchema;
  sequelize
    .query(
      'select cl.clinicname ,cl.id as clinicid ,u.id as id ,u.username,u."mobileNumber",u.email, u."firstName" ,u."lastName", u."userType" from "userClinics" uc join users u on u.id = uc.userid join clinics cl on cl.id = uc.clinicid where uc."clinicid"=(select clinicid from "userClinics" where userid = ' +
      req.session.userId + ') order by cl.clinicname;',
      // 'select * from users where id IN (SELECT distinct userid FROM "userClinics" AS "userClinic" WHERE "userClinic"."clinicid" IN (select clinicid from "userClinics" where userid = ' +
      //   req.session.userId +
      //   " ) and userid <>" +
      //   req.session.userId +
      //   ");",
      {
        model: userSchema
      }
    )
    .then(data => {
      if (!data.length) {
        return res.status(200).send({
          success: false,
          message: "user not found"
        });
      } else {
        return res.status(200).send({
          success: true,
          total_records: data.length,
          data: data
        });
      }
    }); //userClinicSchema.findAll
}

// Get All USer.
exports.getAllUser = (req, res) => {
  // console.log(req.session);
  if (
    req.session.userId &&
    (req.session.userType == "superAdmin" || req.session.userType == "Admin"
      || req.session.userType == "Doctor" || req.session.userType == "Assistant")
  ) {
    //do nothing
  } else {
    return res.status(200).send({
      success: false,
      message: "You dont have access to get users"
    });
  }
  //---------------------------------------//
  //--------if its admin get only users
  //-- in clinics admin himself
  //---or users created by admin
  //---------------------------------------//
  if (req.session.userType == "superAdmin") {
    getAllSuperAdmin(req, res);
  } else {
    getAllAdmin(req, res);
  } //else (req.session.userType == "admin")
};
exports.getUsersforCall = (req, res) => {
  getAllSuperAdmin(req, res);
};

exports.findDoctor = (req, res) => {
  userSchema
    .findAll({
      where: {
        userType: "Doctor"
      }
    })
    .then(data => {
      if (!data.length) {
        return res.status(200).send({
          success: false,
          message: "user not found"
        });
      } else {
        let itemsProcessed = 0;
        let alldata = [];
        function callBack(res, alldata) {
          return res.status(200).send({
            success: true,
            total_records: alldata.length,
            data: alldata
          });
        }
        data.forEach(element => {
          sequelize
            .query(
              'SELECT * FROM "userClinics" uc  join clinics c on c.id = uc.clinicid  where uc.userid = ' +
              element.id +
              " ",
              {
                model: clinic
              }
            )
            .then(clinicData => {
              alldata[itemsProcessed] = {};
              alldata[itemsProcessed].userdata = {};
              alldata[itemsProcessed].userdata = data[itemsProcessed];
              alldata[itemsProcessed].userdata.clinicData = clinicData;
              itemsProcessed++;
              if (itemsProcessed === data.length) {
                return callBack(res, alldata);
              }
            });
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};
exports.findSuperAdminById = (req, res) => {
  userSchema
    .findAll({
      where: {
        id: req.params.id
      }
    })
    .then(data => {
      if (!data) {
        return res.status(200).send({
          success: true,
          message: "User not found"
        });
      } else {
        return res.status(200).send({
          success: true,
          data: data
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
}
// Getting user by user Id.
exports.findById = (req, res) => {
  if (!req.params.id) {
    return res.status(200).send({
      success: false,
      message: "user id is required"
    });
  }
  userClinicSchema
    .findAll({
      where: {
        userid: req.params.id
      }
    })
    .then(data => {
      let clicnicIdArr = [];
      let userId;
      if (data.length <= 0) {
        return res.status(200).send({
          success: false,
          message: "no user found with id: " + req.params.id
        });
      } else {
        data.forEach(element => {
          clicnicIdArr.push(element.clinicid);
          userId = element.userid;
        });
        clinic
          .findAll({
            where: {
              id: {
                $in: clicnicIdArr
              }
            }
          })
          .then(data => {
            let id = userId
            userSchema
              .findOne({
                where: {
                  id: id
                }
              })
              .then(user1 => {
                return res.status(200).send({
                  success: true,
                  clinic_data: data,
                  user_data: user1
                });
              });
          });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

// Get user by  username or email 
exports.getOneUser = (req, res) => {
  userSchema
    .findAll({
      where: {
        $or: [
          {
            email: {
              $eq: req.body.email
            }
          },
          {
            username: {
              $eq: req.body.username
            }
          }
        ]
      }
    })
    .then(data => {
      if (!data) {
        return res.status(200).send({
          success: true,
          message: "User not found"
        });
      } else {
        return res.status(200).send({
          success: false,
          data: data
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};
exports.updateprofile = (req, res) => {
  let activity = 'Profile Update'
  userSchema
    .update(req.body, {
      returning: true,
      where: {
        id: req.params.id
      }
    }).then(data => {
      // console.log('data.................');
      // console.log(data);
      if (data) {
        // createDeleteLog(req, res, data, activity);
        return res.status(200).send({
          success: true,
          message: 'Profile Updated'

        });

      } else {
        console.log('no update');

      }



    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
}
// Updating user by user Id.
exports.updateUser = (req, res) => {
  console.log(req.body);
  let clinicarr = req.body.clinicid;
  let thisPassword = password.updatePassword(req.body.password);
  let userobj = req.body;
  userobj.password = thisPassword.encryptedString;
  userobj.quickBlockID = thisPassword.decryptedString
  let activity = "update User Log"
  let user = req.session.userId;
  if (
    req.session.userId &&
    (req.session.userType == "superAdmin" || req.session.userType == "Admin")
  ) {
    //do nothing
  } else {
    return res.status(200).send({
      success: false,
      message: "You dont have access to update users"
    });
  }
  userSchema
    .update(userobj, {
      returning: true,
      where: {
        id: req.params.id
      }
    })
    .then(data => {
      if (
        clinicarr instanceof Array &&
        clinicarr.length !== 0
      ) {
        userClinicSchema
          .destroy({
            where: {
              userid: req.params.id,
            }
          }).then(res1 => {
            clinicarr.forEach(element => {
              userClinicSchema
                .create({
                  clinicid: element.id,
                  userid: req.params.id
                }).then(res => {
                  console.log('inserted..........');
                })
                .catch(err => {
                });
            });
          }).catch(err => {
            console.log(err);
          })
      } else {
        return res.status(200).send({
          success: false,
          message: "cannot find clinicid, clinicid must be an array"
        });
      }



      // Create Activity Log when user is updated.
      createDeleteLog(req, res, user, activity);

      return res.status(200).send({
        success: true,
        data: data
      });
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

// Deleting user  if session user is Admin or Super Admin.
exports.deleteUser = (req, res) => {
  let activity = "Delete User Log"
  let user = req.session.userId;
  if (
    req.session.userId &&
    (req.session.userType == "superAdmin" || req.session.userType == "Admin")
  ) {
    //do nothing
  } else {
    return res.status(200).send({
      success: false,
      message: "You dont have access to delete users"
    });
  }
  userSchema
    .destroy({
      where: {
        id: req.params.id,
        userType: {
          $not: "superAdmin"
        }
      }
    })
    .then(data => {
      if (!data) {
        return res.status(200).send({
          success: false,
          message:
            "Either user type is super admin or user was not found with given id"
        });
      } else {
        // Create Activity Log when user is Deleted.
        createDeleteLog(req, res, user, activity);
        return res.status(200).send({
          success: true,
          message: "User deleted successfully"
        });
      }
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

// Search user with differnt Attributes of user 
exports.search = (req, res) => {
  userSchema
    .findAll({
      where: {
        $or: [
          {
            email: {
              $ilike: "%" + req.body.searchquery + "%"
            }
          },
          {
            username: {
              $ilike: "%" + req.body.searchquery + "%"
            }
          },
          {
            firstName: {
              $ilike: "%" + req.body.searchquery + "%"
            }
          },
          {
            lastName: {
              $ilike: "%" + req.body.searchquery + "%"
            }
          },
          {
            userType: {
              $ilike: "%" + req.body.searchquery + "%"
            }
          },
          {
            mobileNumber: {
              $ilike: "%" + req.body.searchquery + "%"
            }
          }
        ]
      }
    })
    // sequelize
    //   .query(
    //     'select cl.clinicname ,cl.id as clinicid ,u.id as id ,u.username,u."mobileNumber",u.email, u."firstName" ,u."lastName", u."userType" from "userClinics" uc join users u on u.id = uc.userid join clinics cl on cl.id = uc.clinicid where uc."clinicid"=(select clinicid from "userClinics" where userid = ' +
    //     req.session.userId +') AND (u.username like "%'+
    //     req.body.searchquery 
    //     +'%" or u.email like %'+req.body.searchquery +'%" or u."firstName" like "%'+req.body.searchquery +'%" or u."lastName" like "%'+req.body.searchquery +'%" or u."userType" like "%'+req.body.searchquery +'%" or u."mobileNumber" like "%'+req.body.searchquery +'%"   ) order by cl.clinicname;',
    //     {
    //       model: userSchema
    //     }
    //   )
    .then(data => {
      return res.status(200).send({
        success: true,
        total_records: data.length,
        data: data
      });
    })
    .catch(err => {
      return res.status(200).send({
        success: false,
        message: err.message
      });
    });
};

/*
*  function for  Activity Log that take userId
*  and activityname  to create Activity Log.
*/
function createDeleteLog(req, res, user, act1) {
  let loggeduser = {}
  let activity = act1
  // Get User By User Id.
  getuser(user, function (err, result) {
    loggeduser = res;
    let username = result.firstName + ' ' + result.lastName
    // Get Clinic Name By Clinic Id.
    getclinicname(result.id, function (err, clinicname) {
      ActivityLog.create({
        userName: username,
        email: result.email,
        userType: result.userType,
        clinicName: clinicname,
        activity: activity,
        userId: result.id,
      }).then(data => {
        // console.log('Log Created.');

      })
    });
  })
}

// Get User by User Id.
function getuser(id, callback) {
  let result
  userSchema.findAll({
    where: {
      id: id
    }
  }).then(data => {
    result = data[0].dataValues
    callback(null, result)
  })

}

// Get clinic Name by Clinic Id.
function getclinicname(id, callback) {
  let clicnicname = String;
  sequelize
    .query(
      'select clinicname from clinics where id = (select clinicid from "userClinics" where userid = ' + id + ' limit 1);',
      {
        model: clinic
      }
    ).then(data => {
      if (data.length <= 0) {
        clicnicname = null;
      }
      else {
        clicnicname = data[0].dataValues.clinicname
      }
      return callback(null, clicnicname)
    })
}


exports.updatePassword = (req, res) => {
  console.log(req.body);
  var passwordIsValid = bcrypt.compareSync(
    req.body.oldpass,
    req.body.password
  );

  if (!passwordIsValid) {
    console.log('Invalid password ');
    return res.status(200).send({
      success: true,
      message: "Invalid Current Password",
    });
  } else {
    console.log('password Match');
    let thisPassword = password.updatePassword(req.body.newpass);
    let userobj = req.body;
    userobj.password = thisPassword.encryptedString;
    userobj.quickBlockID = thisPassword.decryptedString
    userSchema
      .update(userobj, {
        returning: true,
        where: {
          id: req.body.id
        }
      })
      .then(data => {
        return res.status(200).send({
          success: true,
          data: data
        });
      })
      .catch(err => {
        return res.status(200).send({
          success: false,
          message: err.message
        });
      });
  }
}
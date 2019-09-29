const ClinicSchema = require('../models').clinic;
const userClinicSchema = require('../models').userClinic;
const user= require('../models').user;
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);

/*
* Create Clinic  if session user is SuperAdmin
* or Admin.
*/
exports.createClinic = (req, res) => {
    if (
        req.session.userId &&
        (req.session.userType == "superAdmin" ||
          req.session.userType == "Admin" )
      ) {
        //do nothing
      } else {
        return res.status(200).send({
          success: false,
          message: "You dont have access to create clinic"
        });
      }
    ClinicSchema.create(req.body)
        .then(data => {
            return res.status(200).send({
                success: true,
                data: data
            })
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// Get All Clinics if session user is SuperAdmin or Admin.
exports.getAllClinic = (req, res) => {
    if (
        req.session.userId &&
        (req.session.userType == "superAdmin" ||
          req.session.userType == "Admin")
      ) {
        //do nothing
      } else {
        return res.status(200).send({
          success: false,
          message: "You dont have access to get clinics"
        });
      }
    ClinicSchema.findAll()
        .then(data => {
            if (!data.length) {
                return res.status(200).send({
                    success: false,
                    message: "clinic not found"
                })

            } else {
                let itemsProcessed = 0;
                let alldata = [];
                function callBack(res,alldata){
                    return res.status(200).send({
                        success: true,
                        total_records: alldata.length,
                        data: alldata
                    })
                }
                
                data.forEach(element => {
                    sequelize
                    .query('SELECT * FROM "userClinics" uc  join users u on u.id = uc.userid  where uc.clinicid = '+element.id +' ',
                    {
                    model: user
                    }).then(userData=>{
                        alldata[itemsProcessed] = {}
                        alldata[itemsProcessed].clinicData = {}
                        alldata[itemsProcessed].clinicData = data[itemsProcessed];
                        alldata[itemsProcessed].clinicData.userData = userData;
                        itemsProcessed++;
                        if(itemsProcessed === data.length) {
                            return callBack(res,alldata);
                          }
                    });
                })

            }
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// Get Clinic  By Clinic Id.
exports.getOneClinic = (req, res) => {
    ClinicSchema.findOne({
            where: {
                id: req.params.id
            }
        })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "clinic not found"
                })
            } else {
                return res.status(200).send({
                    success: true,
                    data: data
                })
            }
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// Get All User Clinic  by clinic id.
exports.getAllUsersByClinic = (req, res) => {
    sequelize
            .query('SELECT * FROM "userClinics" uc  join users u on u.id = uc.userid  where uc.clinicid = '+req.params.id +' ',
            {
            model: user
            })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "clinic not found"
                })
            } else {
                return res.status(200).send({
                    success: true,
                    data: data
                })
            }
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// update Clinic.
exports.updateClinic = (req, res) => {
    if (
        req.session.userId &&
        (req.session.userType == "superAdmin" ||
          req.session.userType == "Admin")
      ) {
        //do nothing
      } else {
        return res.status(200).send({
          success: false,
          message: "You dont have access to update clinic"
        });
      }
    ClinicSchema.update(req.body, {
            returning: true,
            where: {
                id: req.params.id
            }
        })
        .then(data => {
            return res.status(200).send({
                success: true,
                data: data
            })
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// Delete Clinic.
exports.deleteClinic = (req, res) => {
    if (
        req.session.userId &&
        (req.session.userType == "superAdmin" ||
          req.session.userType == "Admin")
      ) {
        //do nothing
      } else {
        return res.status(200).send({
          success: false,
          message: "You dont have access to delete clinic"
        });
      }
    ClinicSchema.destroy({
            where: {
                id: req.params.id
            }
        })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "clinic not found"
                })
            } else {
                return res.status(200).send({
                    success: true,
                    message: "clinic deleted successfully"
                })
            }
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// Delete User Clinic.
exports.userFromClinic = (req, res) => {
    userClinicSchema.destroy({
            where: {
                userid: req.params.userid, 
                clinicid: req.params.clinicid, 
            }
        })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "clinic or user not found"
                })
            } else {
                return res.status(200).send({
                    success: true,
                    message: "user deleted successfully"
                })
            }
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// Search Clinic by clinic name 
exports.search = (req, res) => {
    ClinicSchema
      .findAll({
        where: {
          $or: [
            {
                clinicname: {
                $ilike: "%" + req.body.searchquery + "%"
              }
            }
          ]
        }
      })
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

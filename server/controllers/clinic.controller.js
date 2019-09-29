const ClinicSchema = require('../models').clinic;
const userClinicSchema = require('../models').userClinic;
const user = require('../models').user;
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const ActivityLog = require("../models").activityLog;

exports.createClinic = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Clinic ";
    // Create Clinic if User is SuperAdmin or Admin
    if (
        req.session.userId &&
        (req.session.userType == "superAdmin" ||
            req.session.userType == "Admin")
    ) {
        //do nothing
    } else {
        return res.status(200).send({
            success: false,
            message: "You dont have access to create clinic"
        });
    }
    // Create Clinic 
    ClinicSchema.create(req.body)
        .then(data => {
            // Create Activity Log When Clinic is created.
            createDeleteLog(req, res, user, activity);
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
// Get All Clinic Records
exports.getAllClinic = (req, res) => {
    //Need this service for calling so allowing access
    // if (
    //     req.session.userId &&
    //     (req.session.userType == "superAdmin" ||
    //       req.session.userType == "Admin")
    //   ) {
    //     //do nothing
    //   } else {
    //     return res.status(200).send({
    //       success: false,
    //       message: "You dont have access to get clinics"
    //     });
    //   }
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
                function callBack(res, alldata) {
                    return res.status(200).send({
                        success: true,
                        total_records: alldata.length,
                        data: alldata
                    })
                }

                data.forEach(element => {
                    sequelize
                        .query('SELECT * FROM "userClinics" uc  join users u on u.id = uc.userid  where uc.clinicid = ' + element.id + ' ',
                            {
                                model: user
                            }).then(userData => {
                                alldata[itemsProcessed] = {}
                                alldata[itemsProcessed].clinicData = {}
                                alldata[itemsProcessed].clinicData = data[itemsProcessed];
                                alldata[itemsProcessed].clinicData.userData = userData;
                                itemsProcessed++;
                                if (itemsProcessed === data.length) {
                                    return callBack(res, alldata);
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

// Clinic by Clinic Id
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

exports.getAllUsersByClinic = (req, res) => {
    sequelize
        .query('SELECT * FROM "userClinics" uc  join users u on u.id = uc.userid  where uc.clinicid = ' + req.params.id + ' ',
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
// updating Clinic by Clinic Id
exports.updateClinic = (req, res) => {
    let user = req.session.userId;
    let activity = "Update Clinic ";
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
            // Create Activity Log when Clinic update
            createDeleteLog(req, res, user, activity);
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

/* Delete Clinic by id and Delete only if login user
*  is SuperAdmin or Admin 
 */
exports.deleteClinic = (req, res) => {
    let activity = "Delete Clinic"
    let user = req.session.userId;

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
                // Create Activity Log when Clinic is Deleted
                createDeleteLog(req, res, user, activity);
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

// Deleting Record from User Clinic by userId and clinic id
exports.userFromClinic = (req, res) => {
    let user = req.session.userId;
    let activity = "Delete Clinic"
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
                // Create Activity Log when User Clinic is Deleted
                createDeleteLog(req, res, user, activity);
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

// Search Clinic by character containing in Clinic Name.
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

/*
*  function for  Activity Log that take userId
*  and activityname  to create Activity Log.
*/
function createDeleteLog(req, res, user, act1) {
    let loggeduser = {}
    let activity = act1
    // get user data by id.
    getuser(user, function (err, result) {
        loggeduser = res;
        let username = result.firstName + ' ' + result.lastName
        // getting clinic name by clinic id.
        getclinicname(result.id, function (err, clinicname) {
            ActivityLog.create({
                userName: username,
                email: result.email,
                userType: result.userType,
                clinicName: clinicname,
                activity: activity,
                userId: result.id,
            }).then(data => {
                console.log('Log Created.');
            })
        });
    })
}

// Get User by Id.
function getuser(id, callback) {
    let result
    user.findAll({
        where: {
            id: id
        }
    }).then(data => {
        result = data[0].dataValues
        callback(null, result)
    })
}

// Get Clinic name From Clinic Id.
function getclinicname(id, callback) {
    let clicnicname = String;
    sequelize
        .query(
            'select clinicname from clinics where id = (select clinicid from "userClinics" where userid = ' + id + ' limit 1);',
            {
                model: ClinicSchema
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
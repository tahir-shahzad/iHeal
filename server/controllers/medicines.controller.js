const MedicinesSchema = require("../models").medicines;
const user = require('../models').user
var env = process.env.NODE_ENV || "development";
var config_db = require(__dirname + "/../config/config.json")[env];
var Sequelize = require("sequelize");
const ActivityLog = require("../models").activityLog;

var sequelize = new Sequelize(
    config_db.database,
    config_db.username,
    config_db.password,
    config_db
);
const userClinicSchema = require("../models").userClinic;
const clinic = require("../models").clinic;


// Create Medicine 
exports.createMedicines = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Medicine"
    MedicinesSchema.create(req.body)
        .then(data => {
            // Create Activity Log for Creating Medicine
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

// Get All Medicines 
exports.getAllMedicines = (req, res) => {
    MedicinesSchema.findAll()
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "medicines not found"
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
        });
};

// Get Medicine by Id
exports.getOneMedicines = (req, res) => {
    MedicinesSchema.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "medicines not found"
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
};

// Updating  Medicine by Id
exports.updateMedicines = (req, res) => {
    let user = req.session.userId;
    let activity = "Update Medicine"
    MedicinesSchema.update(req.body, {
        returning: true,
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            // Creating update Medicine Activity Log
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

// Delete Medicine by Id
exports.deleteMedicines = (req, res) => {
    let user = req.session.userId;
    let activity = "Delete Medicine"
    MedicinesSchema.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "medicines not found"
                });
            } else {
                // Create Activity Log for Medicine Delete
                createDeleteLog(req, res, user, activity);
                return res.status(200).send({
                    success: true,
                    message: "medicines deleted successfully"
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

// Searching Medicine with  character  containing in Medicine name 
exports.search = (req, res) => {
    MedicinesSchema
        .findAll({
            where: {
                $or: [
                    {
                        medicineName: {
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

//  get user by Id
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

// get clinic name by clinic Id
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
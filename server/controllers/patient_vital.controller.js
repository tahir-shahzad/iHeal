const patientVitalSchema = require("../models").patientVital;
const patientSchema = require('../models').patient;
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
// patientSchema.hasMany(patientVitalSchema, {
//     foreignKey: 'patientId'
//     })

patientVitalSchema.hasOne(patientSchema, {
    foreignKey: 'id'
})

// Create Patient Vital.
exports.create = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Patient Vital Log";
    patientVitalSchema.create(req.body)
        .then(data => {
            // Create Activity Log when Patient Vital is created.
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

// Getting All Patient Vitals.
exports.getAll = (req, res) => {
    let limit = 3; // number of records per page
    let offset = 0;
    patientVitalSchema.findAndCountAll({
        order: [
            ['id', 'DESC'],
        ],
        where: {
            patientId: req.body.patient_id
        }
    })
        .then((data) => {
            let page = req.body.page; // page number
            let pages = Math.ceil(data.count / limit);
            offset = limit * (page - 1);
            patientVitalSchema.findAll({
                where: {
                    patientId: req.body.patient_id
                },
                limit: limit,
                offset: offset,
                $sort: {
                    id: 1
                }
            })
                .then(newData => {
                    if (!newData) {
                        return res.status(200).send({
                            success: false,
                            message: "patient not found"
                        })

                    } else {
                        patientSchema.findAll({
                            where: {
                                id: req.body.patient_id
                            }
                        })
                            .then(patients => {
                                res.status(200).send({
                                    success: true,
                                    total_records: data.count,
                                    records_per_page: limit,
                                    total_pages: pages,
                                    current_page: req.params.page,
                                    from_record: offset,
                                    to_record: offset + 3,
                                    data: newData,
                                    patient: patients
                                });
                            })
                            .catch(err => {
                                return res.status(200).send({
                                    success: false,
                                    message: err.message
                                })
                            })
                    }
                })
                .catch(err => {
                    return res.status(200).send({
                        success: false,
                        message: err.message
                    })
                })
        });
};

// Getting Patient Vital by Patient Vitals id.
exports.getOne = (req, res) => {
    patientVitalSchema.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "record not found"
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

// Update Patient Vitals by Id.
exports.update = (req, res) => {
    let user = req.session.userId;
    let activity = "Update Patient Vital Log";
    patientVitalSchema.update(req.body, {
        returning: true,
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            // Create Activity Log  when Patient Vital is updated.
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

// Deleting patient vitals by Id.
exports.delete = (req, res) => {
    let user = req.session.userId;
    let activity = "Delete Patient Vital"
    patientVitalSchema.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: false,
                    message: "record not found"
                });
            } else {
                // create Activity Log When  Patient vital is Deleted.
                createDeleteLog(req, res, user, activity);
                return res.status(200).send({
                    success: true,
                    message: "record deleted successfully"
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

// Getting Patient Vital history by Patient Id and Created Data.
exports.getPatientVitalHistory = (req, res) => {
    let myDate = new Date(req.body.createdAt)
    patientVitalSchema.findAll({
        where: {
            $and: [
                {
                    patientId: req.body.patientId,
                },
                {
                    createdAt: myDate
                }
            ]
        }
    }).then(data => {
        if (data.length <= 0) {
            res.send({
                success: false,
                message: "No Patient Vital Found"
            })
        }
        else {
            res.send({
                success: true,
                data: data
            })
        }

    }).catch(err => {
        return res.status(200).send({
            success: false,
            message: err.message
        });
    });
}

/*
*  function for  Activity Log that take userId
*  and activityname  to create Activity Log.
*/
function createDeleteLog(req, res, user, ac1) {
    let loggeduser = {}
    let activity = ac1
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

// get user data by id.
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

// getting clinic name by clinic id.
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
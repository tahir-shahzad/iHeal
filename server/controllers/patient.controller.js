const PatientSchema = require('../models').patient;
const PatientInfoSchema = require('../models').patientDetail;
const user = require('../models').user
const fs = require("fs");
const uuidv4 = require("uuid/v4");
const path = require("path");
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
PatientSchema.hasOne(PatientInfoSchema, {
    foreignKey: 'patientId',
    sourceKey: 'id'

});
PatientInfoSchema.hasOne(clinic, {
    foreignKey: "id",
    sourceKey: 'clinicid'
})

PatientInfoSchema.belongsTo(PatientSchema, { foreignKey: 'patientId' });
PatientInfoSchema.belongsTo(clinic, { foreignKey: 'clinicid' });
// PatientSchema.belongsTo(Patient1, { primayKey: 'id' });

// Create Patient.
exports.createPatient = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Patient ";
    PatientSchema.create({
        title: req.body.patient.title,
        firstName: req.body.patient.firstName,
        middleName: req.body.patient.middleName,
        lastName: req.body.patient.lastName,
        primaryMobileNumber: req.body.patient.primaryMobileNumber,
        gender: req.body.patient.gender,
        dateBirth: req.body.patient.dateBirth,
        age: req.body.patient.age
    })
        .then(data => {
            if (req.body.patientDetails) {
                if (!req.body.patientDetails.picture) {
                    // Create Activity Log when patient is created.
                    createDeleteLog(req, res, user, activity);
                    // Create patient without patient images.
                    createWithoutImage(req, data, res);
                } else {
                    // Create Activity Log when patient is created.
                    createDeleteLog(req, res, user, activity);
                    // Create patient with patient images.
                    createWithImage(req, data, res);
                }

            } else {
                return res.status(200).send({
                    success: false,
                    message: "Patient created But Patient info is not created",
                    patient_data: data
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

// Get All Patient Record with pagination of 8 Record Per Page.
exports.getAllPatient = (req, res) => {
    if (req.session.userType == 'superAdmin') {
        getSuperAdminPatient(req, res);
    }
    else {
        getNormalPatient(req, res);
    }
    // sequelize
    //     .query(
    //         'SELECT clinicid FROM "userClinics" WHERE userid = ' + req.session.userId + ' ;',
    //         { type: sequelize.QueryTypes.SELECT }
    //     ).then(result => {
    //         let clinicarr = [];
    //         if (req.session.userType == 'superAdmin') {
    //             clinic = []
    //         }
    //         else {
    //             clinicarr = result.map(({ clinicid }) => clinicid)
    //         }
    //         PatientInfoSchema.findAll({
    //             where: {
    //                 clinicid: { $in: clinicarr }
    //             },
    //             include: [clinic, PatientSchema]
    //         }).then(patientinfo => {
    //             res.send({
    //                 success: true,
    //                 data: patientinfo
    //             })
    //             console.log(patientinfo.length);
    //         })
    //     })


};


//Get All Patient Name .....
exports.FindAllPatientName = (req, res) => {
    PatientSchema.findAll().then(data => {
        res.send({
            success: true,
            data: data
        })
    })
}
function getNormalPatient(req, res) {

    sequelize
        .query(
            'SELECT clinicid FROM "userClinics" WHERE userid = ' + req.session.userId + ' ;',
            { type: sequelize.QueryTypes.SELECT }
        ).then(result => {
            let clinicarr = []
            clinicarr = result.map(({ clinicid }) => clinicid)

            sequelize
                .query(
                    'SELECT "patientId"  FROM "patientDetails" WHERE clinicid in (' + clinicarr + ')' + ' ;',
                    { type: sequelize.QueryTypes.SELECT }
                ).then(patientinfo => {
                    let patientarr = patientinfo.map(({ patientId }) => patientId)

                    let limit = 8; // number of records per page
                    let offset = 0;
                    PatientSchema.findAndCountAll({
                        id: {
                            $in: patientarr
                        }
                    })
                        .then((data) => {
                            let page = req.params.page; // page number
                            let pages = Math.ceil(data.count / limit);
                            offset = limit * (page - 1);
                            PatientSchema.findAll({
                                where: {
                                    id: {
                                        $in: patientarr
                                    },
                                },
                                limit: limit,
                                offset: offset,
                                order: [['createdAt', 'DESC']]
                            })
                                .then(newData => {
                                    if (!newData.length) {
                                        return res.status(200).send({
                                            success: false,
                                            message: "patient not found"
                                        })
                                    } else {
                                        let to_record;
                                        if (page == pages) {
                                            to_record = data.count
                                        }
                                        else {
                                            to_record = offset + 8
                                        }
                                        let count = 0;
                                        let alldata = [];
                                        function Result(res, alldata) {
                                            return res.status(200).send({
                                                success: true,
                                                total_records: data.count,
                                                records_per_page: limit,
                                                total_pages: pages,
                                                current_page: req.params.page,
                                                from_record: offset + 1,
                                                to_record: to_record,
                                                data: alldata
                                            });
                                        }
                                        newData.forEach(element => {
                                            getclinicnameBypatientID(element.id, function (err, result) {
                                                alldata[count] = {};
                                                alldata[count] = newData[count];
                                                alldata[count].clinicname = result;
                                                count++;
                                                if (count === newData.length) {
                                                    return Result(res, alldata);
                                                }
                                            })
                                        });
                                    }
                                })
                                .catch(err => {
                                    return res.status(200).send({
                                        success: false,
                                        message: err.message
                                    })
                                })
                        });
                })
        })
}

function getSuperAdminPatient(req, res) {
    let limit = 8; // number of records per page
    let offset = 0;
    PatientSchema.findAndCountAll()
        .then((data) => {
            let page = req.params.page; // page number
            let pages = Math.ceil(data.count / limit);
            offset = limit * (page - 1);
            PatientSchema.findAll({
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']]
            })
                .then(newData => {
                    if (!newData.length) {
                        return res.status(200).send({
                            success: false,
                            message: "patient not found"
                        })
                    } else {
                        let to_record;
                        if (page == pages) {
                            to_record = data.count
                        }
                        else {
                            to_record = offset + 8
                        }
                        let count = 0;
                        let alldata = [];
                        function Result(res, alldata) {
                            return res.status(200).send({
                                success: true,
                                total_records: data.count,
                                records_per_page: limit,
                                total_pages: pages,
                                current_page: req.params.page,
                                from_record: offset + 1,
                                to_record: to_record,
                                data: alldata
                            });
                        }
                        newData.forEach(element => {
                            getclinicnameBypatientID(element.id, function (err, result) {
                                alldata[count] = {};
                                alldata[count] = newData[count];
                                alldata[count].clinicname = result;
                                count++;
                                if (count === newData.length) {
                                    return Result(res, alldata);
                                }
                            })
                        });
                    }
                })
                .catch(err => {
                    return res.status(200).send({
                        success: false,
                        message: err.message
                    })
                })
        });
}
// Get Patient by Id.
exports.getOnePatient = (req, res) => {
    PatientSchema.findOne({
        where: {
            id: req.params.id
        },
        include: [
            {
                model: PatientInfoSchema,
                raw: true,
                include: [
                    {
                        model: clinic,
                        attributes: ['clinicname'],
                    },
                ],
            },
        ],
    })
        .then(data => {
            if (!data.length) {
                return res.status(200).send({
                    success: true,
                    patient_data: data,
                })
            } else {
                return res.status(200).send({
                    success: false,
                    message: "patient not found"
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

// Update Patient by Id.
exports.updatePatient = (req, res) => {
    let user = req.session.userId;
    let activity = "Update Patient ";
    req.body.basic.id = req.params.id;
    PatientSchema.update(req.body.basic, {
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            // checking if patient detail exist using patientId foreign key
            PatientInfoSchema.findOne({
                where: {
                    patientId: req.params.id
                }
            })
                .then(patientInfo => {
                    if (patientInfo) {
                        // Create Activity Log when patient is created.
                        createDeleteLog(req, res, user, activity);
                        // updating patient Detail 
                        updatePatientDetailInfo(req, res, data);
                    } else {
                        //Create Patient Detail.
                        createPatientDetailInfo(req, res, data);
                    }
                })
                .catch(err => {
                    return res.status(200).send({
                        success: false,
                        message: err.message
                    })
                })
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            })
        })
}

// Delete Patient by Id.
exports.deletePatient = (req, res) => {

    let user = req.session.userId;
    let activity = "Delete Patient"
    PatientSchema.destroy({
        where: {
            id: req.params.id
        },
        include: [{
            model: PatientInfoSchema,
            foreignKey: 'patientId'
        }]
    })
        .then(data => {
            if (!data) {
                return res.status(200).send({
                    success: true,
                    message: "patient not found"
                })
            } else {
                // Create Activity Log when patient  is Deleted.
                createDeleteLog(req, res, user, activity);
                return res.status(200).send({
                    success: true,
                    message: "patient deleted successfully"
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

// Craete Patient with  images upload.
function createWithImage(req, data, res) {
    base64Converter(req, res, (err, path, req, res) => {
        let picture_path = path;
        PatientInfoSchema.create({
            maritialstatus: req.body.patientDetails.maritialstatus,
            education: req.body.patientDetails.education,
            occupation: req.body.patientDetails.occupation,
            nationality: req.body.patientDetails.nationality,
            cnic: req.body.patientDetails.cnic,
            country: req.body.patientDetails.country,
            stateprovince: req.body.patientDetails.stateprovince,
            city: req.body.patientDetails.city,
            streetaddress: req.body.patientDetails.streetaddress,
            secondarymobile: req.body.patientDetails.secondarymobile,
            othermobile: req.body.patientDetails.othermobile,
            email: req.body.patientDetails.email,
            clinicid: req.body.patientDetails.clinicid,
            registrationdate: req.body.patientDetails.registrationdate,
            companyname: req.body.patientDetails.companyname,
            designation: req.body.patientDetails.designation,
            otheridentification: req.body.patientDetails.otheridentification,
            reference: req.body.patientDetails.reference,
            referredby: req.body.patientDetails.referredby,
            insurancecompany: req.body.patientDetails.insurancecompany,
            picture: picture_path,
            patientId: data.id
        })
            .then(patientInfo => {
                return res.status(200).send({
                    success: true,
                    patient_basic_info: data,
                    patient_info: patientInfo
                });
            })
            .catch(err => {
                return res.status(200).send({
                    success: false,
                    message: err.message
                });
            });
    });
}

// Create patient without image upload
function createWithoutImage(req, data, res) {
    PatientInfoSchema.create({
        maritialstatus: req.body.patientDetails.maritialstatus,
        education: req.body.patientDetails.education,
        occupation: req.body.patientDetails.occupation,
        nationality: req.body.patientDetails.nationality,
        cnic: req.body.patientDetails.cnic,
        country: req.body.patientDetails.country,
        stateprovince: req.body.patientDetails.stateprovince,
        city: req.body.patientDetails.city,
        streetaddress: req.body.patientDetails.streetaddress,
        secondarymobile: req.body.patientDetails.secondarymobile,
        othermobile: req.body.patientDetails.othermobile,
        email: req.body.patientDetails.email,
        clinicid: req.body.patientDetails.clinicid,
        registrationdate: req.body.patientDetails.registrationdate,
        companyname: req.body.patientDetails.companyname,
        designation: req.body.patientDetails.designation,
        otheridentification: req.body.patientDetails.otheridentification,
        reference: req.body.patientDetails.reference,
        referredby: req.body.patientDetails.referredby,
        insurancecompany: req.body.patientDetails.insurancecompany,
        patientId: data.id
    })
        .then(patientInfo => {
            return res.status(200).send({
                success: true,
                patient_basic_info: data,
                patient_info: patientInfo,
                message: "file is not uploaded"
            });
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            });
        });
}

// Create Patient Detail Info.
function createPatientDetailInfo(req, res, data) {
    let user = req.session.userId;
    let activity = "Create Patient Info ";
    PatientInfoSchema.create({
        patientId: req.params.id,
        maritialstatus: req.body.others.maritialstatus,
        education: req.body.others.education,
        occupation: req.body.others.occupation,
        nationality: req.body.others.nationality,
        cnic: req.body.others.cnic,
        country: req.body.others.country,
        stateprovince: req.body.others.stateprovince,
        city: req.body.others.city,
        streetaddress: req.body.others.streetaddress,
        secondarymobile: req.body.others.secondarymobile,
        othermobile: req.body.others.othermobile,
        email: req.body.others.email,
        clinicid: req.body.others.clinicid,
        registrationdate: req.body.others.registrationdate,
        companyname: req.body.others.companyname,
        designation: req.body.others.designation,
        otheridentification: req.body.others.otheridentification,
        reference: req.body.others.reference,
        referredby: req.body.others.referredby,
        insurancecompany: req.body.others.insurancecompany
    })
        .then(updatedPatient => {
            // Create Activity Log when patient Detail is created.
            createDeleteLog(req, res, user, activity);
            return res.status(200).send({
                success: true,
                created_patient_info: updatedPatient,
                update_patient: data
            });
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            });
        });
}

// update patient info.
function updatePatientDetailInfo(req, res, data) {
    let user = req.session.userId;
    let activity = "Update Patient Info ";
    PatientInfoSchema.update(req.body.others, {
        where: {
            patientId: req.params.id
        }
    })
        .then(updatedPatient => {
            // Create Activity Log when patient info is  updated.
            createDeleteLog(req, res, user, activity);
            return res.status(200).send({
                success: true,
                update_patient_info: updatedPatient,
                update_patient: data
            });
        })
        .catch(err => {
            return res.status(200).send({
                success: false,
                message: err.message
            });
        });
}

// Seach patient when different search criterias.
exports.search = (req, res) => {
    PatientSchema.findAll({
        where: {
            $or: [
                {
                    'firstName': {
                        $ilike: '%' + req.body.searchquery + '%'
                    }
                },
                {
                    'middleName': {
                        $ilike: '%' + req.body.searchquery + '%'
                    }
                },
                {
                    'lastName': {
                        $ilike: '%' + req.body.searchquery + '%'
                    }
                },
                {
                    'primaryMobileNumber': {
                        $ilike: '%' + req.body.searchquery + '%'
                    }
                },
                {
                    'title': {
                        $ilike: '%' + req.body.searchquery + '%'
                    }
                }
            ]
        },
        include: [PatientInfoSchema]
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
        })
}

function base64Converter(req, res, callback) {
    let base64ImgStr = req.body.patientDetails.picture;
    let type = req.body.patientDetails.pictureType;
    let destDir = path.join(__dirname, '../../');
    let dbPath = 'assets/patient_img/' + uuidv4() + '.' + type;
    let imgPath = destDir + dbPath;
    fs.writeFile(imgPath, base64ImgStr, 'base64', (err) => {
        if (err) {
            console.log(err);
        } else {
            callback(err, dbPath, req, res);
        }
    });
}

// Get Clinic name by Patient Id.
function getclinicnameBypatientID(id, callBack) {
    let clinicname = '';
    sequelize
        .query(
            'select clinicname from clinics where id=(select clinicid from "patientDetails" where "patientId" =' + id + ');',
            { type: sequelize.QueryTypes.SELECT }
        )
        .then(data => {
            // console.log(data[0].clinicname, 'dataaaaaa------');

            if (!data[0]) {
                clinicname = null
            }
            else {
                clinicname = data[0].clinicname;

            }
            callBack(null, clinicname)
        })
}


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
exports.searchByMobileNumber = (req, res) => {
    // exports.searchByMobileNumber=(res,res)=>{
    console.log(req.params.no);
    PatientSchema.findOne({
        where: {
            primaryMobileNumber: req.params.no
        }
    }).then(data => {
        res.send({
            success: true,
            data: data
        })
    }).catch(err => {
        res.send({
            success: false,
            message: 'Error in Reteriving Patient'
        })
    })
}
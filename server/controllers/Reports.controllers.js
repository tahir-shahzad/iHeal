const fitnessReports = require('../models').fitnessReports;
const prescriptionReports = require('../models').prescriptionReports;
const medicalProfileReports = require('../models/').medicalProfileReports;
const eventReports = require('../models').eventReports;
const medicalCertificateReports = require('../models').medicalCertificateReports;
const consentFormReports = require('../models').consentFormReports;
const ClinicSchema = require('../models').clinic;
const userClinicSchema = require('../models').userClinic;
const newPrescription = require('../models').newPrescription;
const prescriptionMedicine = require('../models').prescriptionMedicine;
const labSets = require('../models').labSets;
const user = require('../models').user;
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const ActivityLog = require("../models").activityLog;

// Create Fitness Reports.
exports.createFitnessReports = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Fitness  Report ";
    let body = req.body
    fitnessReports.create(body).then(data => {
        if (data) {
            // Create Activity Log when fitness Report is created.
            createLogFile(req, res, user, activity);
            res.send({
                success: true,
                data: data
            })
        }
        else {
            res.send({
                success: false,
                message: 'Isssue in creating Fitness Report'
            })
        }
    })
}

/* Get Fitness Reports by patient Id with Pagination 
** as 1 report per page.
*/
exports.getfitnessReportsByPatientId = (req, res) => {
    let page = req.params.page
    let patientid = req.params.id
    row_count = 1;
    offset = (page - 1) * row_count
    sequelize
        .query(
            'select *,(select count(id) from "fitnessReports" where "patientId"= ' + patientid + ' )as totalcount from "fitnessReports" where "patientId"=' + patientid + '  LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
            { type: sequelize.QueryTypes.SELECT }
        ).then(data => {
            if (data.length <= 0) {
                res.send({
                    success: true,
                    message: "No Reports found"
                })
            }
            else {
                let totalRecord = data[0].totalcount
                res.send({
                    success: true,
                    currentPage: page,
                    totalPages: totalRecord,
                    totalRecord: totalRecord,
                    data: data

                })
            }
        }).catch(error => {
            res.send({
                success: false,
                message: error.message
            })
        })
}


// Create  Prescription Reports.
exports.createPrescriptionReports = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Prescription Report ";
    let body = req.body
    prescriptionReports.create(body).then(data => {
        if (data) {
            // Create Activity Log When Prescription Report is created.
            createLogFile(req, res, user, activity);
            res.send({
                success: true,
                data: data
            })
        }
        else {
            res.send({
                success: false,
                message: 'Isssue in creating Prescription Report'
            })
        }
    })
}


/* Get Prescription Reports by patient Id with Pagination 
** as 1 report per page.
*/
exports.getPrescriptionReportsByPatientId = (req, res) => {
    let page = req.params.page
    let patientid = req.params.id
    row_count = 1;
    offset = (page - 1) * row_count
    sequelize
        .query(
            // 'select *,(select count(id) from "prescriptionReports" where "patientId"= ' + patientid + ' )as totalcount from "prescriptionReports" where "patientId"=' + patientid + '  LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
            'select "newPrescriptions"."id","newPrescriptions"."clinicId","newPrescriptions"."lifeStyleInstructions" as instructions ,"newPrescriptions"."doctorId", "newPrescriptions"."createdAt" , '+
            
            '(select count(id) from "newPrescriptions" where "patientId"= ' + patientid + ' ) as totalcount ,' +
            ' (select CONCAT_WS (\' \',"firstName","middleName","lastName") from "patients" where "id"= ' + patientid + ' ) as patientName , '+
            ' (select CONCAT_WS (\' \',"firstName","lastName") from "users" where "id"= "newPrescriptions"."doctorId" ) as doctorName, '+
            ' (select "extraRemarks" from "prescriptions" where "id"= "newPrescriptions"."id" ) as extraRemarks, '+
            ' (select clinicname from clinics where id=(select clinicid from "patientDetails" where "patientId" = ' + patientid + ' )) as clinicName '+
           '  '+
            '  from "newPrescriptions" where "patientId"= ' + patientid + ' order by id desc  LIMIT ' + row_count + ' OFFSET ' + offset + ' ; ',
            {model: prescriptionReports},
            { type: sequelize.QueryTypes.SELECT }
        ).then(data => {
            if (data.length <= 0) {
                res.send({
                    success: true,
                    message: "No Reports found"
                })
            }
            else {
                let totalRecord = data[0].totalcount;
                let totalPages = Math.ceil(totalRecord / row_count);
                let newComplaintdata ;
                let newMedicinedata ; 
                let newLabSetdata ; 
                let processedMedicine = false, ProcessedComplaints = false ,processedlabSet = false;
                function callBack(res, complData,medData,labData) {
                    console.log("alldata")
                    if(complData){
                        newComplaintdata = complData;
                    }
                    if(medData){
                        newMedicinedata = medData;
                    }
                    if(labData){
                        newLabSetdata = labData;
                    }
                    if(processedMedicine && ProcessedComplaints && processedlabSet)
                    res.send({
                        success: true,
                        currentPage: page,
                        totalPages: totalPages,
                        totalRecord: totalRecord,
                        data: data,
                        complaints: newComplaintdata,
                        medicines: newMedicinedata,
                        labSets: newLabSetdata,
                    })
                  }
                    ///////////////////////////////////////////////////////
                    sequelize
                    .query(
                        ' SELECT  * '+
                        ' FROM "prescriptionComplaints" where "patientId" = ' + patientid + ' and "prescriptionId" = ' + data[0].id + " ",
                        {
                          model: newPrescription
                        }
                    )
                    .then(Complaintdata => {
                        ProcessedComplaints = true;
                        return callBack(res, Complaintdata , null, null);
                    });
                    //////////////////////////////////////////////////////
                    ///////////////////////////////////////////////////////
                    sequelize
                    .query(
                        ' SELECT  * '+
                        ' FROM "prescriptionMedicines" where "patientId" = ' + patientid + ' and "prescriptionId" = ' + data[0].id + " ",
                        {
                          model: prescriptionMedicine
                        }
                    )
                    .then(Medicinedata => {
                        processedMedicine = true;
                        return callBack(res, null, Medicinedata,null);
                    });
                    //////////////////////////////////////////////////////
                    ///////////////////////////////////////////////////////
                    sequelize
                    .query(
                        ' SELECT  * '+
                        ' FROM "labSets" where  "prescriptionId" = ' + data[0].id + " ",
                        {
                          model: labSets
                        }
                    )
                    .then(labSetdata => {
                        processedlabSet = true;
                        return callBack(res, null,null, labSetdata);
                    });
                    //////////////////////////////////////////////////////
            }
        }).catch(error => {
            res.send({
                success: false,
                message: error.message
            })
        })
}

// Create Medical Profile Reports.
exports.createMedicalProfileReports = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Medical Profile Report ";
    let body = req.body
    medicalProfileReports.create(body).then(data => {
        if (data) {
            /* Create Activity Log when Medical Profile 
            ** Report is created
            */
            createLogFile(req, res, user, activity);
            res.send({
                success: true,
                data: data
            })
        }
        else {
            res.send({
                success: false,
                message: 'Isssue in creating Medical Profile Report'
            })
        }
    })
}


/* Get Medical Profile Reports by patient Id with Pagination 
** as 1 report per page.
*/
exports.getMedicalProfileReportsByPatientId = (req, res) => {
    let page = req.params.page
    let patientid = req.params.id
    row_count = 1;
    offset = (page - 1) * row_count
    sequelize
        .query(
            // 'select *,(select count(id) from "medicalProfileReports" where "patientId"= ' + patientid + ' )as totalcount from "medicalProfileReports" where "patientId"=' + patientid + '  LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
            'select "patientVitals"."id","chronicDisease","drugAllergies","medication","notes" as remarks, "patientVitals"."createdAt" , '+
            
            '(select count(id) from "patientVitals" where "patientId"= ' + patientid + ' ) as totalcount ,' +
            ' (select CONCAT_WS (\' \',"firstName","middleName","lastName") from "patients" where "id"=  ' + patientid + ' ) as patientName , '+
            ' (select clinicname from clinics where id=(select clinicid from "patientDetails" where "patientId" =  ' + patientid + ' )) as clinicName '+
            '  from "patientVitals" where "patientId"=  ' + patientid + '   LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
            { type: sequelize.QueryTypes.SELECT }
        ).then(data => {
            if (data.length <= 0) {
                res.send({
                    success: true,
                    message: "No Reports found"
                })
            }
            else {
                let totalRecord = data[0].totalcount;

                let totalPages = Math.ceil(totalRecord / row_count);
                res.send({
                    success: true,
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecord: totalRecord,
                    data: data
                })
            }
        }).catch(error => {
            res.send({
                success: false,
                message: error.message
            })
        })
}

// Create Medical Certificate Reports.
exports.createMedicalCertficateReports = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Medical Certificate Report ";
    let body = req.body
    medicalCertificateReports.create(body).then(data => {
        if (data) {
            /* Create Activity Log when Medical Certificate 
           ** Report is created
           */
            createLogFile(req, res, user, activity);
            res.send({
                success: true,
                data: data
            })
        }
        else {
            res.send({
                success: false,
                message: 'Isssue in creating Medical Certificate  Report'
            })
        }
    })
}


/*  Get Medical Certificate Reports by patient Id 
**  with Pagination  as 1 report per page.
*/
exports.getMedicalCertficateReports = (req, res) => {
    let page = req.params.page
    let patientid = req.params.id
    row_count = 1;
    offset = (page - 1) * row_count
    sequelize
        .query(
            // 'select *,(select count(id) from "medicalCertificateReports" where "patientId"= ' + patientid + ' )as totalcount from "medicalCertificateReports" where "patientId"=' + patientid + '  LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
            'select "newPrescriptions"."id","newPrescriptions"."doctorId", "newPrescriptions"."createdAt" , '+

            '(select count(id) from "newPrescriptions" where "patientId"= ' + patientid + ' ) as totalcount ,' +
            '(select CONCAT_WS ( \' \',"firstName","middleName","lastName") from "patients" where "id"=  ' + patientid + ' ) as patientName ,'+
            '(select CONCAT_WS ( \' \',"firstName","lastName") from "users" where "id"= "newPrescriptions"."doctorId" ) as doctorName,'+
            '(select CONCAT_WS ( \' \',"streetaddress","city","stateprovince","country") from "patientDetails" where "patientId"=  ' + patientid + ' ) as patientAddress,'+
            //'(select "details" from "prescriptionComplaints" where "prescriptionId"= "newPrescriptions"."id" ) as notes '+
            '(select string_agg("details", \', \') from "prescriptionComplaints" where "prescriptionId"= "newPrescriptions"."id" GROUP BY "prescriptionId") as notes ' +
             ' from "newPrescriptions" where "patientId"=  ' + patientid  + '  LIMIT ' + row_count + ' OFFSET ' + offset + ' ; ',
            { type: sequelize.QueryTypes.SELECT }
        ).then(data => {
            if (data.length <= 0) {
                res.send({
                    success: true,
                    message: "No Reports found"
                })
            }
            else {
                let totalRecord = data[0].totalcount
                let totalPages = Math.ceil(totalRecord / row_count);
                res.send({
                    success: true,
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecord: totalRecord,
                    data: data
                })
            }
        }).catch(error => {
            res.send({
                success: false,
                message: error.message
            })
        })
}

// Create Event Reports.
exports.createEventReports = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Event Report ";
    let body = req.body
    eventReports.create(body).then(data => {
        if (data) {
            // Create Activity Log when Event Reports is created.
            createLogFile(req, res, user, activity);
            res.send({
                success: true,
                data: data
            })
        }
        else {
            res.send({
                success: false,
                message: 'Isssue in creating Consent Form Report'
            })
        }
    })
}


/* Get Event Reports  with Pagination 
** as 1 report per page.
*/
exports.getEventReports = (req, res) => {
    let page = req.params.page
    row_count = 1;
    offset = (page - 1) * row_count
    sequelize
        .query(
            'select *,(select count(id) from "eventReports" ) as totalcount from "eventReports"   LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
            { type: sequelize.QueryTypes.SELECT }
        ).then(data => {
            if (data.length <= 0) {
                res.send({
                    success: true,
                    message: "No Reports found"
                })
            }
            else {
                let totalRecord = data[0].totalcount
                res.send({
                    success: true,
                    currentPage: page,
                    totalPages: totalRecord,
                    totalRecord: totalRecord,
                    data: data
                })
            }
        }).catch(error => {
            res.send({
                success: false,
                message: error.message
            })
        })
}

// Create Concent Form Reports.
exports.createconcentFormReports = (req, res) => {
    let user = req.session.userId;
    let body = req.body
    let activity = "create Concent Report"
    consentFormReports.create(body).then(data => {
        if (data) {
            /* Create Activity Log when Concent Form 
           ** Report is created
           */
            createLogFile(req, res, user, activity);
            res.send({
                success: true,
                data: data
            })
        }
        else {
            res.send({
                success: false,
                message: 'Isssue in creating Event Report'
            })
        }
    })
}

/* Get Concent Form Reports by patient Id with Pagination 
** as 1 report per page.
*/
exports.getconcentFormReports = (req, res) => {
    let page = req.params.page
    let patientid = req.params.id
    row_count = 1;
    offset = (page - 1) * row_count
    sequelize
        .query(
            'select *,(select count(id) from "consentFormReports" where "patientId"= ' + patientid + ' )as totalcount from "consentFormReports" where "patientId"=' + patientid + '  LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
            { type: sequelize.QueryTypes.SELECT }
        ).then(data => {
            if (data.length <= 0) {
                res.send({
                    success: true,
                    message: "No Reports found"
                })
            }
            else {
                let totalRecord = data[0].totalcount
                res.send({
                    success: true,
                    currentPage: page,
                    totalPages: totalRecord,
                    totalRecord: totalRecord,
                    data: data
                })
            }
        }).catch(error => {
            res.send({
                success: false,
                message: error.message
            })
        })
}

/*
*  function for  Activity Log that take userId
*  and activityname  to create Activity Log.
*/
function createLogFile(req, res, user, activity1) {
    let loggeduser = {}
    let activity = activity1
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
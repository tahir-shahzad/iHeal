const chat = require('../models').chat;
const ClinicSchema = require('../models').clinic;
const userClinicSchema = require('../models').userClinic;
const user = require('../models').user;
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const ActivityLog = require("../models").activityLog;

/*
* Create Chat 
*/

exports.createChat = (req, res) => {
    let user = req.session.userId;
    let activity = "Create Chat Logs";
    let body = req.body
    console.log(body);
    chat.create(body).then(data => {
        if (data) {
            createLogFile(req, res, user, activity);
            res.send({
                success: true,
                data: data
            })
        }
        else {
            res.send({
                success: false,
                message: 'Isssue in creating Chat'
            })
        }
    })
}

/*
* Get Chat by Room  name
*/
exports.getChat = (req, res) => {
    chat.findAll(
        {
            where: {
                Room: req.params.room
            }
        }
    ).then(data => {
        if (data.length <= 0) {
            res.send({
                success: true,
                message: "No Reports found"
            })
        }
        else {
            res.send({
                success: true,
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



function createLogFile(req, res, user, activity1) {
    let loggeduser = {}
    let activity = activity1
    getuser(user, function (err, result) {
        loggeduser = res;
        let username = result.firstName + ' ' + result.lastName
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
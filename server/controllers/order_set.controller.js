const OrderSetSchema = require("../models").orderSet;
var env = process.env.NODE_ENV || "development";
var config_db = require(__dirname + "/../config/config.json")[env];
var Sequelize = require("sequelize");
const ActivityLog = require("../models").activityLog;
const user = require('../models').user
var sequelize = new Sequelize(
  config_db.database,
  config_db.username,
  config_db.password,
  config_db
);
const userClinicSchema = require("../models").userClinic;
const clinic = require("../models").clinic;


// Create Order Set.
exports.createOrderSet = (req, res) => {
  let user = req.session.userId;
  let activity = "Create Order Set Log"
  OrderSetSchema.create(req.body)
    .then(data => {
      // Creating Activity Log when Order Set is Created.
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

// Get All Order Set.
exports.getAllOrderSet = (req, res) => {
  OrderSetSchema.findAll()
    .then(data => {
      if (!data) {
        return res.status(200).send({
          success: false,
          message: "order not found"
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

// Get Order Set By Order Set Id.
exports.getOneOrderSet = (req, res) => {
  OrderSetSchema.findOne({
    where: {
      id: req.params.id
    }
  })
    .then(data => {
      if (!data) {
        return res.status(200).send({
          success: false,
          message: "order not found"
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

// Update Order Set By Order Set Id.
exports.updateOrderSet = (req, res) => {
  let user = req.session.userId;
  let activity = "Update Order Set Log"
  OrderSetSchema.update(req.body, {
    returning: true,
    where: { id: req.params.id }
  })
    .then(data => {
      // Create Activity Log When order Set is Updated.
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

// Delete Order Set by Order Set Id. 
exports.deleteOrderSet = (req, res) => {
  let user = req.session.userId;
  let activity = "Delete Order Set Log"
  OrderSetSchema.destroy({
    where: { id: req.params.id }
  })
    .then(data => {
      if (!data) {
        return res.status(200).send({
          success: false,
          message: "order not found"
        });
      } else {
        // Create Activity Log When order Set is Deleted.
        createDeleteLog(req, res, user, activity);
        return res.status(200).send({
          success: true,
          message: "order deleted successfully"
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
    // console.log('reulst', result);

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
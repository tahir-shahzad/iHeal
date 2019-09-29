const user = require("../models").user;
// const  userClinic
const callSession = require("../models").callSession;
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var config = require("../config/config");
const OpenTok = require("opentok"),
  opentok = new OpenTok(config.apiKey, config.apiSecret);
const ActivityLog = require("../models").activityLog;
var env = process.env.NODE_ENV || "development";
var config_db = require(__dirname + "/../config/config.json")[env];
var Sequelize = require("sequelize");

var sequelize = new Sequelize(
  config_db.database,
  config_db.username,
  config_db.password,
  config_db
);
const password = require("../utilities/password.utility");
const userClinicSchema = require("../models").userClinic;
const clinic = require("../models").clinic;
module.exports = {
  create(req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    return user
      .create({
        email: req.body.email,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        userType: req.body.userType
      })
      .then(user => {
        let logged_user = user.dataValues;
        delete logged_user.password;
        req.session.user = logged_user;
        // create a token
        var token = jwt.sign({ id: logged_user.id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, user: logged_user, token: token });
      })
      .catch(error => {
        res.status(200).send({
          message: "Some error occured,",
          error: error
        });
      });
  },
  changeStatus(req, res) {
    let status = 'Offline'
    return user.update({ status: status }, {
      returning: true,
      where: {
        id: req.params.id
      }
    }).then(data => {
      res.send({
        success: true,
        message: 'Status Changed'
      })
      console.log('Status Changed');
    })
  },
  is_login(req, res) {
    let data = {};
    if (req.session.user && req.cookies.user_sid) {
      data.succeed = true;
      data.message = "session exist";
      data.user_data = req.session.user;
    } else {
      /* We are able to set the HTTP status code on the res object*/
      data.succeed = false;
      data.message = "please login to continue";
    }
    res.statusCode = 200;
    return res.json(data);
  },
  logout(req, res) {
    console.log('inside controller');
    console.log(req.session.userId);


    return user.update({ status: 'Offline' }, {
      returning: true,
      where: {
        id: req.session.user.id
      }
    }).then(data => {
      console.log('Status Changed');
    })
  },

  login(req, res) {
    console.log(req.body);
    let loginloc = req.body.loc
    return user
      .findOne({
        where: {
          $or: [{ email: req.body.email }, { username: req.body.email }]
        }
      })
      .then(user => {
        if (!user) {
          res
            .status(200)
            .send({ auth: false, message: "User not found", token: null });
        } else {
          let logged_user = user.dataValues;

          var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            logged_user.password
          );
          delete logged_user.password;

          if (!passwordIsValid) {
            return res.status(200).send({
              auth: false,
              message: "Invalid email or password",
              token: null
            });
          }
          else {
            console.log(logged_user, 'user data...........');
            sequelize
              .query(
                'SELECT clinicid FROM "userClinics" WHERE userid = ' + user.id + ' ;',
                { type: sequelize.QueryTypes.SELECT }
              ).then(clinic => {
                console.log('cliniccccccccccccccccccccccccccccccc');
                let clinicarr = clinic.map(({ clinicid }) => clinicid)
                console.log(clinicarr);
                if (user.userType == 'superAdmin') {
                  logged_user.clinic = clinicarr
                  var token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400 /*expires in 24 hours*/
                  });
                  logged_user.full_name =
                    user.dataValues.firstName + " " + user.dataValues.lastName;
                  req.session.user = logged_user;
                  res.status(200).send({ auth: true, user: logged_user, token: token });
                  updateuserStatus(logged_user)
                  createLoginLog(req, res, logged_user);
                } else {
                  LocationRestriction(clinicarr, loginloc, (err, result) => {
                    if (result) {
                      logged_user.clinic = clinicarr
                      var token = jwt.sign({ id: user._id }, config.secret, {
                        expiresIn: 86400 /*expires in 24 hours*/
                      });
                      logged_user.full_name =
                        user.dataValues.firstName + " " + user.dataValues.lastName;
                      req.session.user = logged_user;
                      res.status(200).send({ auth: true, user: logged_user, token: token });
                      updateuserStatus(logged_user)
                      createLoginLog(req, res, logged_user);
                    }
                    else if (err) {
                      console.log('You are in specificied clinic Range to Login');
                      res.status(200).send({ auth: true, message: 'You are not in specificied clinic Range to Login', token: null });
                    }
                  })
                }
              })

          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  },
  // get activity log//

  //-----------------------------------------------//



  findall(req, res) {
    return user
      .findAll()
      .then(data => {
        if (!data) {
          res
            .status(200)
            .send({ auth: false, message: "No data found", token: null });
        } else {
          res.status(200).send({ auth: true, users: data });
        }
      })
      .catch(error => {
        res.status(200).send({ auth: false, message: error.message });
      });
  },

  // Create Session 
  createSession(req, res) {
    opentok.createSession(function (err, session) {
      if (err) {
        console.log(err);
        return res.status(200).send({
          success: false,
          message: err.message
        });
      }
      let token = session.generateToken();
      callSession
        .create({
          userId: req.body.userId,
          room: req.body.room,
          sessionId: session.sessionId,
          receiverId: session.receiverId,
          token: token
        })
        .then(data => {
          let user = req.session.user;
          return res.status(200).send({
            success: true,
            room: req.body.room,
            sessionId: session.sessionId,
            token: token
          });
        });
    });
  },

  // Get All Activity Log with pagination 8 record per page.
  getActivityLog(req, res) {
    if (
      req.session.userId &&
      (req.session.userType == "superAdmin" ||
        req.session.userType == "Admin")
    ) {
      let page = req.params.page
      row_count = 8;
      offset = (page - 1) * row_count
      sequelize
        .query(
          'select *,(select count(id) from "activityLog")as totalcount from "activityLog"  order by id desc  LIMIT ' + row_count + ' OFFSET ' + offset + ' ;',
          { type: sequelize.QueryTypes.SELECT }
        ).then(data => {
          let total = data[0].totalcount
          let totalpages = Math.ceil(total / row_count);
          res.send({
            totalRecord: total,
            currentPage: page,
            totalPages: totalpages,
            success: true,
            data: data
          })
        })
    } else {
      return res.status(200).send({
        success: false,
        message: "You dont have access to View Activity Log"
      });
    }


  },

  // find Session by Room
  findSession(req, res) {
    return callSession
      .findAll({
        where: {
          room: req.body.room
        },
        order: [
          ['id', 'DESC'],
        ],
      }).then(data => {
        console.log(data);
        return res.status(200).send({
          success: true,
          data: data
        });
      }).catch(error => {
        res.status(200).send({ success: false, message: error.message });
      });
  },

  // Deleting Session by session Id.
  destroySession(req, res) {
    callSession.destroy({
      where: {
        sessionId: req.params.session_id
      }
    }).then(data => {
      return res.status(200).send({
        success: true,
        message: "Session Deleted Successfully"
      });
    }).catch(error => {
      res.status(200).send({ success: false, message: error.message });
    });
  }
};


// Get clinic Name  by user Id
function getclinicname(id, callback) {
  let clicnicname = String;
  sequelize
    .query(
      'select clinicname from clinics where id = (select clinicid from "userClinics" where userid = ' + id + ' limit 1 );',
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

// Create Login Log.
function createLoginLog(req, res, user) {
  let clinicname = String;
  let activity = 'Logged In'
  getclinicname(user.id, function (err, result) {
    clinicname = result;
    let username = user.firstName + ' ' + user.lastName
    ActivityLog.create({
      userName: username,
      email: user.email,
      userType: user.userType,
      clinicName: clinicname,
      activity: activity,
      userId: user.id,
    }).then(data => {
      console.log('Log Created.');

    })
  })
}

//update User Status..
function updateuserStatus(data) {
  let status = 'Online'
  data.status = status
  user.update(data, {
    // returning: true,
    where: {
      id: data.id
    }
  }).then(data => {
    console.log("user Status Updated.");
  })
}


// Location Restriction.
function LocationRestriction(data, loginloc, callback) {
  let kmarr = []
  sequelize
    .query(
      'SELECT latitude,longitude FROM "clinics" WHERE id in (' + data + ')' + ' ;',
      { type: sequelize.QueryTypes.SELECT }
    ).then(result => {
      console.log(result);
      result.forEach(element => {
        let R = 6371;
        let deg2rad = (n) => { return Math.tan(n * (Math.PI / 180)) };
        let dLat = deg2rad(loginloc.lat - element.latitude);
        let dLon = deg2rad(loginloc.long - element.longitude);
        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(element.latitude)) * Math.cos(deg2rad(loginloc.lat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in KM
        kmarr.push(d)
        console.log('Km...........');
        // console.log(kmarr);
      });
      let km = kmarr.find(kmr => kmr < 11)
        if (km) {
          callback(null, true)
        } else {
          callback(true, null)
        }
    }).catch(err=>{
      console.log(err);
      
    })
}


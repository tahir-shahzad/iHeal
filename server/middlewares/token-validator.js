const User = require('../models').user;
// const google = require("googleapis");
// const OAuth2 = google.google.auth.OAuth2;
const auth = require("./auth");
const constants = require("../config/constants");
exports.checkToken = (req, res, next) => {
  // check for user
  if (!req.session.user) 
  {
    return next();
  }
  res.locals.access_token = req.session.user.access_token;
   next();
 };
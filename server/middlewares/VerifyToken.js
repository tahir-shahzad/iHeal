var jwt = require('jsonwebtoken');
var config = require('./config');
function verifyToken(req, res, next) {
  // console.log(req.headers)
  var token = req.headers['x-access-token'];
  req.session.userType = req.headers['x-requested-by'];
  req.session.userId = req.headers['x-requested-id'];
  console.log('user type in middele ware');
    console.log( req.session.userType);
  
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });
}
module.exports = verifyToken;

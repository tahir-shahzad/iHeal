const userController = require('../controllers').user;
var VerifyToken = require('../middlewares/VerifyToken');
const user = require('../models/user');
var env = process.env.NODE_ENV || "development";
var config_db = require(__dirname + "/../config/config.json")[env];
var Sequelize = require("sequelize");

var sequelize = new Sequelize(
	config_db.database,
	config_db.username,
	config_db.password,
	config_db
);
/* middleware function to check for logged-in users*/
var sessionChecker = (req, res, next) => {
	if (req.session.user && req.cookies.user_sid) {
		// TODO if already login send data from session
		next();
	} else {
		next();
	}
};

var is_login_middleware_api = (req, res, next) => {
	if (req.session.user && req.cookies.user_sid) {
		next();
	} else {
		res.json({
			error: true,
			noLoggeIn: true,
			msg: "Please login to continue"
		});
	}
};


module.exports = (app) => {
	var server = require('http').Server(app);
	var io = require('socket.io')(server);
	io.on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});
	//----------------------------------------------------------------------//
	app.get('/api', /*VerifyToken,*/(req, res) => {
		io.emit('message', req.body);
		// console.log("here")
		return res.status(200).send({
			message: 'Welcome to the iHeal API!',
		})
	});
	// app.get('/login', sessionChecker, (req, res) => res.render('login')); 
	// app.get('/signup', sessionChecker, (req, res) => res.render('signup')); 

app.get('/api/user/changestatus/:id',userController.changeStatus)
	app.post('/api/user/signup', userController.create);
	app.post('/api/user/login', userController.login);
	app.get('/api/user/is_login', userController.is_login);
	app.get('/api/user/findall', VerifyToken, userController.findall);
	app.post('/api/tokbox/setsession', VerifyToken, userController.createSession);
	app.post('/api/tokbox/getsession', VerifyToken, userController.findSession);
	app.delete('/api/tokbox/destroysession/:session_id', VerifyToken, userController.destroySession);

	//getActivityLog
	app.get('/api/activitylog/:page', VerifyToken, userController.getActivityLog);











	/*--------------------------------------------------*/
	/*						Logout						*/
	/*--------------------------------------------------*/

	// route for user extension logout
	app.get('/api/user/logout', (req, res) => {
		// let id = req.session.userId
		console.log('inside logout');

console.log(req.userId);

		// console.log('...........');
		// console.log(req.session);
		// console.log('......session.....');

		console.log(req.session.user.id);

		let data = {};
		if (req.session.user && req.cookies.user_sid) {
			res.clearCookie('user_sid');
			// updateUserOfflineStatus(req.session.user.id);
			userController.logout(req, res);
			
			
			req.session.destroy();
			data.succeed = true;

			data.message = "session exist";
		} else {
			req.session.destroy();
			data.succeed = false;
			data.message = "already logged out";
		}
		//updateUserOfflineStatus(req.session.userId);
		res.statusCode = 200;
		return res.json(data);
	});


	function updateUserOfflineStatus(userid) {
		console.log('inside function...............');
		console.log(user);

		user.update({ status: 'Offline' }, {
			returning: true,
			where: {
				id: userid
			}
		}).then(data => {
				console.log('Status Changed');
		})
		// sequelize
		// .query('SELECT * FROM "userClinics" uc  join users u on u.id = uc.userid  where uc.clinicid = '+element.id +' ',
		// {
		// model: user
		// })
	}
};

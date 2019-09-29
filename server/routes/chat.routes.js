const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
	const chat = require('../controllers/chat.controller');

	//  create chat routes
	app.post('/api/chat', verifyToken, chat.createChat);
	
	// get chat by Room name
	app.get('/api/chat/:room', verifyToken, chat.getChat);
}
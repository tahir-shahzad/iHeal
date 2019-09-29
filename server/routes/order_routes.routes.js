const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
    const orderSetController = require('../controllers/order_set.controller');

    // order set routes
	app.post('/api/orderset', verifyToken, orderSetController.createOrderSet);
	app.get('/api/orderset', verifyToken, orderSetController.getAllOrderSet);
	app.get('/api/orderset/:id', verifyToken, orderSetController.getOneOrderSet);
	app.put('/api/orderset/:id', verifyToken, orderSetController.updateOrderSet);
	app.delete('/api/orderset/:id', verifyToken, orderSetController.deleteOrderSet);
}
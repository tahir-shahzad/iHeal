const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
	const clinicController = require('../controllers/clinic.controller');

	// clinic routes
	app.post('/api/clinicmanagement/clinic', verifyToken, clinicController.createClinic);
	app.get('/api/clinicmanagement/clinic', verifyToken, clinicController.getAllClinic);
	app.get('/api/clinicmanagement/clinicusers/:id', verifyToken, clinicController.getAllUsersByClinic);
	app.get('/api/clinicmanagement/clinic/:id', verifyToken, clinicController.getOneClinic);
	app.put('/api/clinicmanagement/clinic/:id', verifyToken, clinicController.updateClinic);
	app.delete('/api/clinicmanagement/clinic/:id', verifyToken, clinicController.deleteClinic);
	app.delete('/api/clinicmanagement/userfromclinic/:clinicid/:userid', verifyToken, clinicController.userFromClinic);
    app.post('/api/clinicmanagement/clinicsearch', verifyToken, clinicController.search);
}
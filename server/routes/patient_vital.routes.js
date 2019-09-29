const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
    const patientVitalController = require('../controllers/patient_vital.controller');

    app.post('/api/patients/patientvital', verifyToken, patientVitalController.create);
    app.post('/api/patients/patientvital_page', verifyToken, patientVitalController.getAll);
    app.get('/api/patients/patientvital/:id', verifyToken, patientVitalController.getOne);
    app.put('/api/patients/patientvital/:id', verifyToken, patientVitalController.update);
    app.delete('/api/patients/patientvital/:id', verifyToken, patientVitalController.delete);

    //patient Vital History.
    app.post('/api/patientvital_History', verifyToken, patientVitalController.getPatientVitalHistory);

}
const multer = require('../middlewares/multer_image.middleware');
const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
    const patientController = require('../controllers/patient.controller');

    // patient routes
    app.post('/api/patients/patient', verifyToken, multer.image, patientController.createPatient);
    app.get('/api/patients/patient/:page', verifyToken, patientController.getAllPatient);
    app.get('/api/patients/patient_one/:id', verifyToken, patientController.getOnePatient);
    app.put('/api/patients/patient/:id', verifyToken, patientController.updatePatient);
    app.delete('/api/patients/patient/:id', verifyToken, patientController.deletePatient);
// Search for patient mobile number if exist or not
app.get('/api/patients/searchno/:no', verifyToken, patientController.searchByMobileNumber);

    app.post('/api/patients/patientsearch', verifyToken, patientController.search);

    //get all patient name and id without paginations
    app.get('/api/getAllPatient',verifyToken,patientController.FindAllPatientName)
}
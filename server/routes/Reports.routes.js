const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
    const reportsController = require('../controllers/Reports.controllers');

    // create Fitness Reports
    app.post('/api/fitnessReport', verifyToken, reportsController.createFitnessReports);
    app.get('/api/fitnessReport/:id/:page', verifyToken, reportsController.getfitnessReportsByPatientId);

    //create prescription Reports
    app.post('/api/prescriptionReport', verifyToken, reportsController.createPrescriptionReports);
    app.get('/api/prescriptionReport/:id/:page', verifyToken, reportsController.getPrescriptionReportsByPatientId);


    //create medicalProfile Reports
    app.post('/api/medicalProfileReport', verifyToken, reportsController.createMedicalProfileReports);
    app.get('/api/medicalProfileReport/:id/:page', verifyToken, reportsController.getMedicalProfileReportsByPatientId);

    //create Event Reports.
    app.post('/api/eventReport', verifyToken, reportsController.createEventReports);
    app.get('/api/eventReport/:page', verifyToken, reportsController.getEventReports);


    //create Medical Certificate Reports.
    app.post('/api/medicalcertificateReport', verifyToken, reportsController.createMedicalCertficateReports);
    app.get('/api/medicalcertificateReport/:id/:page', verifyToken, reportsController.getMedicalCertficateReports);

    //concent form Reports.
    app.post('/api/concentFormReport', verifyToken, reportsController.createconcentFormReports);
    app.get('/api/concentFormReport/:id/:page', verifyToken, reportsController.getconcentFormReports);
}
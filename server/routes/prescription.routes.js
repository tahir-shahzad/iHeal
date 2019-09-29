const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
    const perscription = require('../controllers/prescription.controller');

    // patient routes
    app.post('/api/patients/prescription', verifyToken, perscription.create);
    app.post('/api/patients/newprescription', verifyToken, perscription.newPrescriptionCreate);
    app.get('/api/patients/prescription', verifyToken, perscription.findAll);
    app.get('/api/patients/prescription/:id', verifyToken, perscription.findByPatient);

    // Get Prescription Complaint history
    app.post('/api/prescriptionComplaint_history', verifyToken, perscription.getPrescriptionComplaintHistory);

    //get Prescription images history.
    app.post('/api/prescriptionimages_history', verifyToken, perscription.getPrescriptionImagesHistory);

    // get prescription history.
    app.post('/api/prescription_history', verifyToken, perscription.getPrescriptionHistory);

    app.get('/api/patients/prescomplaint/:id', verifyToken, perscription.presComplaints);

    //get latest Prescription Complaint 
    app.get('/api/getlatestPrescriptionComplaint/:id', verifyToken, perscription.getlatestPrescriptionComplaint)

    //Show doctor activitylog.......
    app.post('/api/showdoctoractivity', verifyToken, perscription.showDoctorActivityLog)
}
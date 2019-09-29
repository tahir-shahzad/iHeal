const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
    const medicinesController = require('../controllers/medicines.controller');

    // medicines routes
    app.post('/api/medical/medicines', verifyToken, medicinesController.createMedicines);
    app.get('/api/medical/medicines', verifyToken, medicinesController.getAllMedicines);
    app.get('/api/medical/medicines/:id', verifyToken, medicinesController.getOneMedicines);
    app.put('/api/medical/medicines/:id', verifyToken, medicinesController.updateMedicines);
    app.delete('/api/medical/medicines/:id', verifyToken, medicinesController.deleteMedicines);
    app.post('/api/medical/medicinesearch', verifyToken, medicinesController.search);
}
const verifyToken = require('../middlewares/VerifyToken');

module.exports = (app) => {
    const UserController = require('../controllers/new_user.controller');

    app.post('/api/user/create',verifyToken,  UserController.createUser);
    app.get('/api/user/getall', verifyToken, UserController.getAllUser);
    app.get('/api/user/getusersforcall', verifyToken, UserController.getUsersforCall);
    app.put('/api/user/updateuser/:id', verifyToken, UserController.updateUser);
    app.put('/api/user/updateprofile/:id', verifyToken, UserController.updateprofile);

    app.post('/api/user/getoneuser', verifyToken, UserController.getOneUser);
    app.delete('/api/user/deleteuser/:id', verifyToken, UserController.deleteUser);
    app.get('/api/user/findbyid/:id', verifyToken, UserController.findById);
    app.get('/api/user/getdoctors', verifyToken, UserController.findDoctor);
    app.post('/api/user/usersearch', verifyToken, UserController.search);
    app.get('/api/user/findsuperadmin/:id', verifyToken, UserController.findSuperAdminById);
    app.post('/api/user/updatepassword',verifyToken, UserController.updatePassword)

}
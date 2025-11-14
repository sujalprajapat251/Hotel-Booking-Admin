const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/uploades')
const { createUser, userLogin, updateUser, changePassword, googleLogin, forgotPassword, verifyOtp, resetPassword } = require('../controller/userController');
const { auth } = require('../middleware/auth');
const {
    createRoomType,
    getRoomTypes,
    getRoomTypeById,
    updateRoomType,
    deleteRoomType
} = require('../controller/roomtypecontroller');
const {
    createFeature,
    getFeatures,
    getFeatureById,
    updateFeature,
    deleteFeature
} = require('../controller/featuresController');

// user Routes
indexRoutes.post('/register', createUser);
indexRoutes.post('/userLogin', userLogin);
indexRoutes.post("/google-login", googleLogin);
indexRoutes.post('/forgotPassword', forgotPassword);
indexRoutes.post('/verifyOtp', verifyOtp)
indexRoutes.post('/resetpassword', resetPassword)
indexRoutes.put('/userUpdate', auth, upload.single("photo"),updateUser);
indexRoutes.put('/changepassword', auth, changePassword);

// room type routes
indexRoutes.post('/roomtypes', createRoomType);
indexRoutes.get('/roomtypes', getRoomTypes);
indexRoutes.get('/roomtypes/:id', getRoomTypeById);
indexRoutes.put('/roomtypes/:id', updateRoomType);
indexRoutes.delete('/roomtypes/:id', deleteRoomType);

// feature routes
indexRoutes.post('/features', createFeature);
indexRoutes.get('/features', getFeatures);
indexRoutes.get('/features/:id', getFeatureById);
indexRoutes.put('/features/:id', updateFeature);
indexRoutes.delete('/features/:id', deleteFeature);

module.exports = indexRoutes;
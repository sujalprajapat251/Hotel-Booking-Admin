const express = require('express');
const indexRoutes = express.Router();
const upload = require('../helper/uploades')
const { createUser, userLogin, updateUser, changePassword, googleLogin, forgotPassword, verifyOtp, resetPassword } = require('../controller/userController');
const { auth } = require('../middleware/auth');

// user Routes
indexRoutes.post('/register', createUser);
indexRoutes.post('/userLogin', userLogin);
indexRoutes.post("/google-login", googleLogin);
indexRoutes.post('/forgotPassword', forgotPassword);
indexRoutes.post('/verifyOtp', verifyOtp)
indexRoutes.post('/resetpassword', resetPassword)
indexRoutes.put('/userUpdate', auth, upload.single("photo"),updateUser);
indexRoutes.put('/changepassword', auth, changePassword);

module.exports = indexRoutes;
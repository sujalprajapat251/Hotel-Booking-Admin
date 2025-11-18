const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

exports.createUser = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;

        role = role || "user";


        if (!name || !email || !password) {
            return res.status(400).json({ status: 400, message: 'Name, email and password are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'Email already in use.' });
        }

        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashPassword,
            role
        });

        let token = null;
        if (role === "user") {
            token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
        }

        return res.status(200).json({
            status: 200,
            message: 'User created successfully..!',
            user: user,
            token: token
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.userLogin = async (req, res) => {
    try {
        let { email, password } = req.body;

        let checkEmailIsExist = await User.findOne({ email });

        if (!checkEmailIsExist) {
            return res.status(404).json({ status: 404, message: "Email Not found" });
        }

        let comparePassword = await bcrypt.compare(
            password,
            checkEmailIsExist.password
        );

        if (!comparePassword) {
            return res
                .status(404)
                .json({ status: 404, message: "Password Not Match" });
        }

        let token = await jwt.sign(
            { _id: checkEmailIsExist._id },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        return res.status(200)
            .json({
                status: 200,
                message: "Login SuccessFully..!",
                user: checkEmailIsExist,
                token: token,
            });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        let { uid, name, email, photo } = req.body;
        let checkUser = await User.findOne({ email });
        if (!checkUser) {
            checkUser = await User.create({
                uid,
                name,
                email,
                photo
            });
        }
        checkUser = checkUser.toObject();
        let token = await jwt.sign({ _id: checkUser._id }, process.env.SECRET_KEY, { expiresIn: "1D" })
        return res.status(200).json({ status: 200, message: 'Login SuccessFully..!', user: checkUser, token: token });
    } catch (error) {
        throw new Error(error);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.user._id
        if (req.file) {
            req.body.photo = req.file.path
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { ...req.body, photo: req.body.photo ? req.body.photo : undefined },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "User updated successfully..!",
            user: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        let userId = req.user._id;

        let { oldPassword, newPassword, confirmPassword } = req.body;

        let getUser = await User.findById(userId);

        if (!getUser) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" });
        }

        let correctPassword = await bcrypt.compare(oldPassword, getUser.password);

        if (!correctPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Old Password Not Match",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "New Password And ConfirmPassword Not Match",
            });
        }

        let salt = await bcrypt.genSalt(10);
        let hasPssword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password: hasPssword }, { new: true });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Password Change SuccessFully..!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        let checkEmail = await User.findOne({ email });

        if (!checkEmail) {
            return res.status(404).json({ status: 404, message: "Email Not Found." });
        }

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let otp = Math.floor(1000 + Math.random() * 9000);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Password",
            text: `Your code is: ${otp} `,
        };

        checkEmail.otp = otp;

        await checkEmail.save();

        transport.sendMail(mailOptions, (error) => {
            if (error) {
                return res
                    .status(500)
                    .json({ status: 500, success: false, message: error.message });
            }
            return res.status(200).json({
                status: 200,
                success: true,
                message: "OTP sent successfully via Email..!",
            });
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;

        let chekcEmail = await User.findOne({ email });

        if (!chekcEmail) {
            return res.status(404).json({ status: 404, message: "Email Not Found" });
        }

        if (chekcEmail.otp != otp) {
            return res.status(404).json({ status: 404, message: "Invalid Otp" });
        }

        chekcEmail.otp = undefined;

        await chekcEmail.save();

        return res.status(200).json({
            status: 200,
            message: "Otp Verify SuccessFully..!",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        let { email, newPassword } = req.body;

        let userId = await User.findOne({ email });

        if (!userId) {
            return res.status(404).json({ status: 404, message: "User Not Found" });
        }

        // if (newPassword !== confirmPassword) {
        //     return res.status(400).json({
        //         status: 400,
        //         success: false,
        //         message: "Passwords do not match",
        //     });
        // }

        let salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(newPassword, salt);

        let updatePassword = await User.findByIdAndUpdate(
            userId._id,
            { password: hashPassword },
            { new: true }
        );

        return res.json({
            status: 200,
            success: true,
            message: "Password Reset SuccessFully..!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
      const { email } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          status: 404,
          message: "Email not found.!",
        });
      }
  
      const newOtp = Math.floor(1000 + Math.random() * 9000);
      existingUser.otp = newOtp;
      await existingUser.save();
  
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Resend OTP - Password Reset",
        text: `Your new OTP code is: ${newOtp}`,
      };
  
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            status: 500,
            message: "Failed to send OTP email..!",
          });
        }
  
        return res.status(200).json({
          status: 200,
          success: true,
          message: "New OTP sent successfully via Email..!",
        });
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }); 

        return res.status(200).json({
            status: 200,
            message: "All users fetched successfully..!",
            users,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "User fetched successfully..!",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};





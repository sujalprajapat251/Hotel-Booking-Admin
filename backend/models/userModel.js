const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    photo: {
        type: String,
    },
    mobileno: {
        type: String,
    },
    gender: {
        type: String,
    },
    dob:{
        type:Date
    },
    role: {
        type: String,
        enum: ['user', 'admin','receptionist'],
        default: 'user'
    },
    otp: {
        type: Number,
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('user', userSchema)
const mongoose = require('mongoose')

const staffSchema = mongoose.Schema({
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
    countrycode: {
        type: String,
        required: true
    },
    mobileno: {
        type: Number,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "department"
    },
    designation: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    image: {
        type: String,
    },
    joiningdate: {
        type: Date,
        required: true
    },
    otp: {
        type: Number,
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('staff', staffSchema);
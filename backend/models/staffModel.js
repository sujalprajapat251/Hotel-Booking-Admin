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
        ref: "department",
        required: false  // Optional for drivers
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
    AssignedCab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cab"
    },
    status: {
        type: String,
        enum: ["Available", "Unavailable", "Leave", "onTrip"]
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: function (doc, ret) {
          delete ret.password; 
          return ret;
        },
    },
});

module.exports = mongoose.model('staff', staffSchema);
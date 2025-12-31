const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    countrycode: {
        type: String, 
        required: true
    },
    mobileno: {
        type: String,   
    },
    address: {
        type: String,
    },
    gender: {
        type: String,
    },
    image: {
        type: String,
    },
    joiningdate: {
        type: Date,
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
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        },
    },
});

module.exports = mongoose.model('driver', driverSchema);

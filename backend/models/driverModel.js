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
    status:{
        type:String,
        enum: ["Available" , "Unavailable", "Leave","onTrip"]
    }
}, { timestamps: true });

module.exports = mongoose.model('driver', driverSchema);

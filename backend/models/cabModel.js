const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true,
    },
    modelName: {
        type: String,
        required: true,
    },
    registrationNumber: {
        type: String,
    },
    seatingCapacity: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    fuelType: {
        type: String,
        required: true,
    },
    driverAssigned: {
        type: Boolean,
        default: false
    },
    perKmCharge: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    cabImage: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('cab', cabSchema);

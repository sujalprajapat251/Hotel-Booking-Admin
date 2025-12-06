const mongoose = require("mongoose");

const cabBookingSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "booking",
        required: true
    },
    pickUpLocation: {
        type: String,
        enum: ["Airport", "Railway Station", "Bus Station"],
        required: true,
        default: "Airport"
    },
    preferredSeatingCapacity: {
        type: String,
        enum: ["4", "5", "6", "7", "8", "9", "10+"],
        required: false
    },
    dropLocation: {
        address: {
            type: String,
            default: "Hotel",
        }
    },
    assignedCab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cab"
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff"
    },
    bookingDate: {
        type: Date,
        required: true
    },
    pickUpTime: {
        type: Date,
        required: true
    },
    estimatedDistance: {
        type: Number,
        min: 0
    },
    estimatedFare: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Assigned", "InProgress", "Completed", "Cancelled"],
        default: "Pending"
    },
    specialInstructions: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Index for better query performance
cabBookingSchema.index({ booking: 1 });
cabBookingSchema.index({ assignedCab: 1 });
cabBookingSchema.index({ assignedDriver: 1 });
cabBookingSchema.index({ status: 1 });
cabBookingSchema.index({ bookingDate: 1 });

module.exports = mongoose.model('cabBooking', cabBookingSchema);

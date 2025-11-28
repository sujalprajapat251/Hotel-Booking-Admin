const mongoose = require("mongoose");

const hkTaskSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "room",
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "In-Progress", "Completed"],
        default: "Pending"
    },
}, { timestamps: true });

module.exports = mongoose.model("housekeeping", hkTaskSchema);

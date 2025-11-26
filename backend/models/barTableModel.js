const mongoose = require("mongoose");

const barTableSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
   limit: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default:true
    },
}, { timestamps: true });

module.exports = mongoose.model('barTable', barTableSchema);

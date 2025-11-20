const mongoose = require("mongoose");

const barcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('barcategory', barcategorySchema);

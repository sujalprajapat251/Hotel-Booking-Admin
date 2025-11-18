const mongoose = require("mongoose");

const cafecategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('cafecategory', cafecategorySchema);

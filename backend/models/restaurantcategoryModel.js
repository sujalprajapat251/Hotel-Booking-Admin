const mongoose = require("mongoose");

const restaurantcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('restaurantcategory', restaurantcategorySchema);

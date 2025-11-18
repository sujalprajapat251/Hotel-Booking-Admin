const mongoose = require("mongoose");

const cafeitemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cafecategory"
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    available: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('cafeitem', cafeitemSchema);

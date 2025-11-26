const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    rating: { type: Number, min: 1, max: 5, required: true },
    title: {
        type: String,
        require: true,
    },
    comment: {
        type: String,
        require: true
    },
    reviewType: { 
        type: String,
        enum: ['room', 'cafe', 'bar', 'restaurant'],
        required: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "room"
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('review', reviewSchema);
const mongoose = require('mongoose')

const RoomTypeSchema = mongoose.Schema({
    roomType: {
        type: String,
        require: true
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('roomType', RoomTypeSchema)
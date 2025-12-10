const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roomType',
        required: true
    },
    floor: {
        type: Number,
        required: true,
        min: 0
    },
    viewType: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
        default: 'Available'
    },
    isSmokingAllowed: {
        type: Boolean,
        default: false
    },
    isPetFriendly: {
        type: Boolean,
        default: false
    },
    maintenanceNotes: {
        type: String,
        default: '',
        trim: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'review'
    }],
    cleanStatus: {
        type: String,
        enum: ["Dirty", "Pending", "In-Progress", "Completed", "Clean"],
        default: "Clean",
    },
    cleanassign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff",
        default: null
    },
    description: {
        type: String,
        default: '',
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('room', RoomSchema);


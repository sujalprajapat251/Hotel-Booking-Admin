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
    price: {
        base: {
            type: Number,
            required: true,
            min: 0
        },
        weekend: {
            type: Number,
            required: true,
            min: 0
        }
    },
    capacity: {
        adults: {
            type: Number,
            required: true,
            min: 1
        },
        children: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    },
    features: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feature'
    }],
    bed: {
        mainBed: {
            type: {
                type: String,
                required: true,
                enum: ['Single', 'Double', 'Queen', 'King', 'Twin']
            },
            count: {
                type: Number,
                required: true,
                min: 1
            }
        },
        childBed: {
            type: {
                type: String,
                required: true,
                enum: ['Single', 'Double', 'Queen', 'King', 'Twin']
            },
            count: {
                type: Number,
                required: true,
                min: 1
            }
        }
    },
    viewType: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        type: String,
        trim: true
    }],
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
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('room', RoomSchema);


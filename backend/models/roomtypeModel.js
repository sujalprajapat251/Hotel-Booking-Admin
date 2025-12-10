const mongoose = require('mongoose')

const RoomTypeSchema = mongoose.Schema({
    roomType: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: {
        type: [String],
        default: []
    },
    availableRooms: {
        type: Number,
        required: true,
        min: 0
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
                required: false,
                enum: ['Single', 'Double', 'Queen', 'King', 'Twin']
            },
            count: {
                type: Number,
                required: false,
                min: 0,
                default: 0
            }
        }
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('roomType', RoomTypeSchema);
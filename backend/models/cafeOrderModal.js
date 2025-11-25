const mongoose = require("mongoose");

const cafeOrderSchema = new mongoose.Schema({
    name: {
        type: String
    },
    contact: {
        type: String
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'cafeitem'
            },
            qty: {
                type: Number,
                default: 1
            },
            description: {
                type: String
            },
            status: {
                type: String,
                enum: ['Pending', 'Preparing', 'Done', 'Served'],
                default: 'Pending'
            },
            preparedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                default: null
            }
        }
    ],
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Done', 'Served'],
        default: 'Pending'
    },
    from: {
        type: String,
        enum: ['cafe', 'room'],
        required: true
    },

    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cafeTable",
        required: false
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotelroom",
        required: false
    },
    payment: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    paymentMethod:{
        type: String,
        enum: ['Pending', 'Paid'],
    }
}, { timestamps: true });

cafeOrderSchema.pre("validate", function (next) {
    if (this.from === "cafe" && !this.table) {
        return next(new Error("Table reference is required for cafe orders."));
    }
    if (this.from === "hotel" && !this.room) {
        return next(new Error("Room reference is required for hotel orders."));
    }
    next();
});

module.exports = mongoose.model('cafeorder', cafeOrderSchema);

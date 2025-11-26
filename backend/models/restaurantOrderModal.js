const mongoose = require("mongoose");

const restaurantOrderSchema = new mongoose.Schema({
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
                ref: 'restaurantitem'
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
                ref: 'staff',
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
        enum: ['restaurant', 'room'],
        required: true
    },

    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurantTable",
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
    }
}, { timestamps: true });

restaurantOrderSchema.pre("validate", function (next) {
    if (this.from === "restaurant" && !this.table) {
        return next(new Error("Table reference is required for restaurant orders."));
    }
    if (this.from === "room" && !this.room) {
        return next(new Error("Room reference is required for hotel orders."));
    }
    next();
});

module.exports = mongoose.model('restaurantorder', restaurantOrderSchema);

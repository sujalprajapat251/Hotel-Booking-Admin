const mongoose = require("mongoose");

const barOrderSchema = new mongoose.Schema({
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
                ref: 'baritem'
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
                enum: ['Pending', 'Preparing', 'Done', 'Served','Reject by chef'],
                default: 'Pending'
            },
            preparedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'staff',
                default: null
            }
        }
    ],
    from: {
        type: String,
        enum: ['bar', 'room'],
        required: true
    },

    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "barTable",
        required: false
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "room",
        required: false
    },
    payment: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    paymentMethod:{
        type: String,
    },
    paymentIntentId:{
        type:String,
    },
    total:{
        type: Number,
        default:0
    }
}, { timestamps: true });

barOrderSchema.pre("validate", function (next) {
    if (this.from === "bar" && !this.table) {
        return next(new Error("Table reference is required for bar orders."));
    }
    if (this.from === "room" && !this.room) {
        return next(new Error("Room reference is required for hotel orders."));
    }
    next();
});

module.exports = mongoose.model('barorder', barOrderSchema);

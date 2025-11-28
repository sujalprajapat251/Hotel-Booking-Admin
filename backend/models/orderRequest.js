const mongoose = require("mongoose");

const orderRequestSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "room",
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "staff",
        default: null
    },
    to: {
        type: String,
        enum: ['cafe', 'bar', 'restaurant'],
        required: true
    },

    // This will dynamically change based on the `to` value
    orderModel: {
        type: String,
        required: true,
        enum: ["cafeorder", "barorder", "restaurantorder"]
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "orderModel",
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "In-Progress", "Completed"],
        default: "Pending"
    },

    notes: String,
}, { timestamps: true });

// Auto-generate correct model name based on `to`
orderRequestSchema.pre("validate", function(next) {
    this.orderModel = (this.to || '').toLowerCase() + "order";
    next();
});

module.exports = mongoose.model("orderRequest", orderRequestSchema);

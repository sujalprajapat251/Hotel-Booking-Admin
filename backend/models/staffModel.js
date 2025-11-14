const mongoose = require('mongoose')

const staffSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    mobileno: {
        type: Number,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "department"
    },
    image: {
        type: String,
    },
    joiningdate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('staff', staffSchema);
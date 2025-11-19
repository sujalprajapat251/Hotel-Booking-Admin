const mongoose = require('mongoose')

const AboutUs = mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    subtitle: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
},{
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('AboutUs',AboutUs);

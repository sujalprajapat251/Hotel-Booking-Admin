const mongoose = require('mongoose');

const connectDb = async (req, res) => {
    try {
        await mongoose
            .connect(process.env.MONGODB_PATH)
            .then(() => console.log('DB Is Connected...'))
    } catch (error) {
        console.log(error);
        if (res) {
            return res.json({ status: 500, message: error.message });
        }
        throw error;
    }
}

module.exports = connectDb;
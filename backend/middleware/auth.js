const Staff = require('../models/staffModel')
const jwt = require('jsonwebtoken')

exports.auth = async (req, res, next) => {
    try {
        let authorization = req.headers['authorization']

        if (authorization) {
            let token = await authorization.split(' ')[1]

            if (!token) {
                return res.status(401).json({ status: 401, message: "Token Is Required" })
            }

            let checkToken = jwt.verify(token, process.env.SECRET_KEY)

            let checkUser = await Staff.findById(checkToken._id)

            if (!checkUser) {
                return res.status(401).json({ status: 401, message: "User Not Found" })
            }

            req.user = checkUser

            next()
        }
        else {
            return res.status(401).json({ status: 401, message: "Token Is Required" });
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: 401, message: error.message })
    }
}

exports.adminOnly = (req, res, next) => {
    console.log(req.user)
    if (req.user.designation !== "admin") {
        return res.status(403).json({
            status: 403,
            message: "Access denied! Admin only"
        });
    }
    next();
};

exports.userOnly = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(403).json({
            status: 403,
            message: "Access denied! User only"
        });
    }
    next();
};

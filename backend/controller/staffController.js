const Staff = require("../models/staffModel");
const bcrypt = require("bcrypt");

exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, mobileno, address, department, joiningdate,gender,designation } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await Staff.create({
            name,
            email,
            password: hashedPassword,
            mobileno,
            address,
            department,
            joiningdate,
            gender,
            designation,
            image: req.file ? req.file.path : null
        });

        res.status(201).json({
            success: true,
            message: "Staff created successfully..!",
            data: newStaff
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const Staffs = await Staff.find().populate("department");

        res.status(200).json({
            success: true,
            data: Staffs
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id).populate("department");

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        res.status(200).json({
            success: true,
            data: staff
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { name, email, mobileno, address, department, joiningdate, password,gender,designation } = req.body;

        const updatedData = {
            name,
            email,
            mobileno,
            address,
            department,
            joiningdate,
            gender,
            designation
        };

        if (req.file) {
            updatedData.image = req.file.path;
        }

        if (password) {
            const hashPass = await bcrypt.hash(password, 10);
            updatedData.password = hashPass;
        }

        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        );

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Staff updated successfully..!",
            data: staff
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        await Staff.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Staff deleted successfully..!"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

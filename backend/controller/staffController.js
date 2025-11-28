const Staff = require("../models/staffModel");
const bcrypt = require("bcrypt");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service");

exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, mobileno, address, department, joiningdate, gender, designation } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        let uploadedUrl = null;
        if(req.file){
            uploadedUrl = await uploadToS3(req.file, "uploads/image");
        }

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
            image: uploadedUrl ? uploadedUrl : null
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
        const staffs = await Staff.find({ designation: { $ne: "admin" } })
        .populate("department").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: staffs
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllHODStaff = async (req, res) => {
    try {
        const departmentId = req.user?.department;

        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: "User department not found"
            });
        }

        const staffs = await Staff.find({ department: departmentId, designation: { $ne: "Head of Department" }  })
            .populate("department");

        res.status(200).json({
            success: true,
            data: staffs
        });

    } catch (error) {
        console.error("Error fetching HOD staff:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
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
        const { name, email, mobileno, address, department, joiningdate, password, gender, designation } = req.body;

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
            if (updatedData.image) await deleteFromS3(updatedData.image);
            updatedData.image = await uploadToS3(req.file, "uploads/image");
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

        if (staff.image) {
            await deleteFromS3(staff.image);
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

exports.getStaff = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await Staff.findById(userId).populate("department");

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "User fetched successfully..!",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}
const Staff = require("../models/staffModel");
const bcrypt = require("bcrypt");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service");
const { reassignBookingsForDriver } = require("../utils/driverAssignment");

exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, countrycode, mobileno, address, department, joiningdate, gender, designation, AssignedCab, status } = req.body;

        // Validate required fields based on designation
        if (designation === "Driver") {
            // For drivers, department is optional but other fields are required
            if (!name || !email || !password || !countrycode || !mobileno || !address || !gender || !joiningdate) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required for driver creation"
                });
            }
        } else {
            // For other staff, department is required
            if (!name || !email || !password || !countrycode || !mobileno || !address || !department || !gender || !designation || !joiningdate) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let uploadedUrl = null;
        if(req.file){
            uploadedUrl = await uploadToS3(req.file, "uploads/image");
        }

        const staffData = {
            name,
            email,
            password: hashedPassword,
            countrycode,
            mobileno,
            address,
            joiningdate,
            gender,
            designation,
            image: uploadedUrl ? uploadedUrl : null
        };

        // Add department only if provided (not required for drivers)
        if (department) {
            staffData.department = department;
        }

        // Add driver-specific fields if designation is Driver
        if (designation === "Driver") {
            if (AssignedCab) {
                staffData.AssignedCab = AssignedCab;
            }
            if (status) {
                staffData.status = status;
            } else {
                staffData.status = "Available"; // Default status for drivers
            }
        }

        const newStaff = await Staff.create(staffData);

        const message = designation === "Driver" 
            ? "Driver created successfully..!" 
            : "Staff created successfully..!";

        res.status(201).json({
            success: true,
            message: message,
            data: newStaff
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const staffs = await Staff.find({ designation: { $ne: "admin" } })
        .populate("department")
        .populate("AssignedCab")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: staffs
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Drivers (staff with designation "Driver")
exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await Staff.find({ designation: "Driver" })
            .populate("AssignedCab")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            drivers: drivers
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
        const staff = await Staff.findById(req.params.id)
            .populate("department")
            .populate("AssignedCab");

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
        const { name, email, countrycode, mobileno, address, department, joiningdate, password, gender, designation, AssignedCab, status } = req.body;

        const existingStaff = await Staff.findById(req.params.id);
        
        if (!existingStaff) {
            return res.status(404).json({
                success: false,
                message: "Staff not found"
            });
        }

        const updatedData = {
            name,
            email,
            countrycode,
            mobileno,
            address,
            joiningdate,
            gender,
            designation
        };

        // Handle department - required for non-drivers, optional for drivers
        if (designation === "Driver") {
            // For drivers, department is optional
            if (department !== undefined) {
                updatedData.department = department || null;
            }
        } else {
            // For other staff, department is required
            if (department) {
                updatedData.department = department;
            }
        }

        // Handle driver-specific fields
        if (designation === "Driver") {
            if (AssignedCab !== undefined) {
                updatedData.AssignedCab = AssignedCab || null;
            }
            if (status !== undefined) {
                updatedData.status = status;
            }
        }

        if (req.file) {
            if (existingStaff.image) await deleteFromS3(existingStaff.image);
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
        ).populate("department").populate("AssignedCab");

        // Trigger auto reassignment logic for drivers when status changes to Unavailable
        if (designation === "Driver" && status === "Unavailable" && existingStaff.status !== "Unavailable") {
            await reassignBookingsForDriver(staff._id);
        }

        const message = designation === "Driver" 
            ? "Driver updated successfully..!" 
            : "Staff updated successfully..!";

        return res.status(200).json({
            success: true,
            message: message,
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

        // If it's a driver, trigger reassignment logic before deletion
        if (staff.designation === "Driver") {
            await reassignBookingsForDriver(staff._id);
        }

        await Staff.findByIdAndDelete(req.params.id);

        const message = staff.designation === "Driver" 
            ? "Driver deleted successfully..!" 
            : "Staff deleted successfully..!";

        res.status(200).json({
            success: true,
            message: message
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStaff = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await Staff.findById(userId)
            .populate("department")
            .populate("AssignedCab");

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
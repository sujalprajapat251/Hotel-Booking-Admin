const Driver = require("../models/driverModel");

// Create Driver
exports.createDriver = async (req, res) => {
    try {   
        const { name, email, password, mobileno, address, gender, joiningdate , status , AssignedCab } = req.body;

        const newDriver = await Driver.create({ name, email, password, mobileno, address, gender, joiningdate,status,AssignedCab, image: req.file?.path || null });

        res.status(201).json({
            success: true,
            message: "Driver created successfully",
            data: newDriver
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Drivers
exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().populate("AssignedCab");
        res.status(200).json({ drivers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Driver By ID
exports.getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id).populate("AssignedCab");

        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        res.status(200).json({ driver });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Driver
exports.updateDriver = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If new image file arrives then update image field
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("AssignedCab");

        if (!updatedDriver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        res.status(200).json({ message: "Driver updated successfully", driver: updatedDriver });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);

        if (!deletedDriver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        res.status(200).json({ message: "Driver deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

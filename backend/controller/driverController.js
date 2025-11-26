const Driver = require("../models/driverModel");
const { reassignBookingsForDriver } = require("../utils/driverAssignment");
const { deleteFromS3, uploadToS3 } = require("../utils/s3Service");

// Create Driver
exports.createDriver = async (req, res) => {
    try {   
        let uploadedUrl = null;
        if(req.file){
            uploadedUrl = await uploadToS3(req.file, "uploads/image");
        }
        const { name, email, password, mobileno, address, gender, joiningdate , status , AssignedCab } = req.body;

        const newDriver = await Driver.create({ name, email, password, mobileno, address, gender, joiningdate,status,AssignedCab, image: uploadedUrl ? uploadedUrl : null });

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

        const existingDriver = await Driver.findById(req.params.id);

        if (!existingDriver) {
            return res.status(404).json({ message: "Driver not found" });
        }
        if (req.file) {
            if (existingDriver.image) await deleteFromS3(existingDriver.image);
            const uploadedUrl = await uploadToS3(req.file, "uploads/image");
            req.body.image = uploadedUrl;
        }

        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("AssignedCab");

        // Trigger auto reassignment logic when driver is marked unavailable or removed from service
        if (
            updateData.status === "Unavailable" &&
            existingDriver.status !== "Unavailable"
        ) {
            await reassignBookingsForDriver(updatedDriver._id);
        }

        res.status(200).json({ message: "Driver updated successfully", driver: updatedDriver });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Driver
exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        if (driver.image) {
            await deleteFromS3(driver.image);
        }

        await Driver.findByIdAndDelete(req.params.id);
        await reassignBookingsForDriver(req.params.id);

        return res.status(200).json({ message: "Driver deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


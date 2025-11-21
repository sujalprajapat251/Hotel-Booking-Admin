const Cab = require("../models/cabModel");

// Add Cab
const addCab = async (req, res) => {
    try {
        const {
            vehicleId,
            modelName,
            registrationNumber,
            seatingCapacity,
            status,
            fuelType,
            driverAssigned,
            perKmCharge,
            description,
            cabImage = req.file ? req.file.path : null
        } = req.body;

        if (!cabImage) {
            return res.status(400).json({ message: "Cab image is required" });
        }

        const cab = await Cab.create({
            vehicleId,
            modelName,
            registrationNumber,
            seatingCapacity,
            status,
            fuelType,
            driverAssigned,
            perKmCharge,
            description,
            cabImage
        });

        res.status(201).json({ message: "Cab created successfully", cab });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get All Cabs
const getAllCabs = async (req, res) => {
    try {
        const cabs = await Cab.find();
        res.status(200).json(cabs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Cab by ID
const getCabById = async (req, res) => {
    try {
        const cab = await Cab.findById(req.params.id);
        if (!cab) return res.status(404).json({ message: "Cab not found" });
        res.status(200).json(cab);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Cab
const updateCab = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.cabImage = req.file.path; // save new uploaded image path
        }

        const cab = await Cab.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!cab) {
            return res.status(404).json({ message: "Cab not found" });
        }

        return res.status(200).json({
            message: "Cab updated successfully",
            cab,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Cab
const deleteCab = async (req, res) => {
    try {
        const cab = await Cab.findByIdAndDelete(req.params.id);
        if (!cab) return res.status(404).json({ message: "Cab not found" });
        res.status(200).json({ message: "Cab deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addCab,
    getAllCabs,
    getCabById,
    updateCab,
    deleteCab
};
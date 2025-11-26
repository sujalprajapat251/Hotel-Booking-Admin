const Cab = require("../models/cabModel");
const { deleteFromS3, uploadToS3 } = require("../utils/s3Service");

// Add Cab
const addCab = async (req, res) => {
    try {
        let uploadedUrl = null;
        if(req.file){
            uploadedUrl = await uploadToS3(req.file, "uploads/cabImage");
        }
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
            cabImage = uploadedUrl ? uploadedUrl : null
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

        const existcab = await Cab.findById(req.params.id);
        if (!existcab) {
            return res.status(404).json({ message: "Cab not found" });
        }

        if (req.file) {
            if (existcab.cabImage) await deleteFromS3(existcab.cabImage);
            const uploadedUrl = await uploadToS3(req.file, "uploads/cabImage");
            req.body.cabImage = uploadedUrl;
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
        const cab = await Cab.findById(req.params.id);
        if (!cab) {
            return res.status(404).json({ message: "Cab not found" });
        }

        if (cab.cabImage) {
            await deleteFromS3(cab.cabImage);
        }

        await Cab.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Cab deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = {
    addCab,
    getAllCabs,
    getCabById,
    updateCab,
    deleteCab
};
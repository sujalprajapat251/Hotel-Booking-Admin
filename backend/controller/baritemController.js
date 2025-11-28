const BarItem = require("../models/baritemModel");
const { deleteFromS3, uploadToS3 } = require("../utils/s3Service");

exports.createBarItem = async (req, res) => {
    try {
        const { name, category, price, description } = req.body;

        if (!name || !category || !price || !description) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const existing = await BarItem.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Item name already exists"
            });
        }

        let uploadedUrl = null;
        if (req.file) {
            uploadedUrl = await uploadToS3(req.file, "uploads/image");
            req.body.image = uploadedUrl ? uploadedUrl : null
        }

        const item = await BarItem.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Bar Item created..!",
            data: item
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllBarItems = async (req, res) => {
    try {
        const items = await BarItem.find().populate("category").sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            data: items
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleBarItem = async (req, res) => {
    try {
        const item = await BarItem.findById(req.params.id).populate("category");

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        return res.status(200).json({ success: true, data: item });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBarItem = async (req, res) => {
    try {
        const name = req.body?.name?.trim();
        const duplicate = await BarItem.findOne({
            name: name,
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Item name already exists"
            });
        }

        const item = await BarItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (req.file) {
            if (item.image) await deleteFromS3(item.image);
            const uploadedUrl = await uploadToS3(req.file, "uploads/image");
            req.body.image = uploadedUrl;
        }

        const updated = await BarItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Bar Item updated..!",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteBarItem = async (req, res) => {
    try {
        const item = await BarItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }
        if (item.image) {
            await deleteFromS3(item.image);
        }
        await BarItem.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Bar Item deleted ..!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.changeAvailabilityBarItem = async (req, res) => {
    try {
        const item = await BarItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        item.available = !item.available;
        await item.save();

        return res.status(200).json({
            success: true,
            message: "Availability updated..!",
            data: item
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

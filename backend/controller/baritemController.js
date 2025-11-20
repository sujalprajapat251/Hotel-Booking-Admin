const BarItem = require("../models/baritemModel");

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

        if (req.file) {
            req.body.image = req.file.path;
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
        const items = await BarItem.find().populate("category")

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

        const duplicate = await BarItem.findOne({
            name: req.body.name.trim(),
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Item name already exists"
            });
        }

        if (req.file) {
            req.body.image = req.file.path;
        }

        const updated = await BarItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

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
        const deleted = await BarItem.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

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

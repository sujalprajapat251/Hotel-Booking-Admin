const CafeItem = require("../models/cafeitemModel");

exports.createCafeItem = async (req, res) => {
    try {
        const { name, category, price , description } = req.body;

        if (!name || !category || !price || !description) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        if (req.file) {
            req.body.image = req.file.path;
        }

        const item = await CafeItem.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Cafe Item created..!",
            data: item
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCafeItems = async (req, res) => {
    try {
        const items = await CafeItem.find().populate("category")

        return res.status(200).json({
            success: true,
            data: items
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleCafeItem = async (req, res) => {
    try {
        const item = await CafeItem.findById(req.params.id).populate("category");

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        return res.status(200).json({ success: true, data: item });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCafeItem = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }

        const updated = await CafeItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Cafe Item updated..!",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCafeItem = async (req, res) => {
    try {
        const deleted = await CafeItem.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Cafe Item deleted ..!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.changeAvailability = async (req, res) => {
    try {
        const item = await CafeItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        item.available = !item.available;
        await item.save();

        return res.status(200).json({
            success: true,
            message: "Availability updated",
            data: item
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const BarCategory = require('../models/barcategoryModel');

exports.createBarCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const existing = await BarCategory.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const category = await BarCategory.create({ name });

        return res.status(201).json({
            success: true,
            message: "Bar Category created successfully..!",
            data: category
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllBarCategories = async (req, res) => {
    try {
        const categories = await BarCategory.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleBarCategory = async (req, res) => {
    try {
        const category = await BarCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({ success: true, data: category });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBarCategory = async (req, res) => {
    try {

        const duplicate = await BarCategory.findOne({
            name: req.body.name.trim(),
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

            const updated = await BarCategory.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Bar Category updated...!",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteBarCategory = async (req, res) => {
    try {
        const deleted = await BarCategory.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Bar Category deleted successfully..!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

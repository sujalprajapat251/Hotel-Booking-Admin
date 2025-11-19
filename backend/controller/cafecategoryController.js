const CafeCategory = require('../models/cafecategoryModel');

exports.createCafeCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const existing = await CafeCategory.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const category = await CafeCategory.create({ name });

        return res.status(201).json({
            success: true,
            message: "Cafe Category created successfully..!",
            data: category
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCafeCategories = async (req, res) => {
    try {
        const categories = await CafeCategory.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleCafeCategory = async (req, res) => {
    try {
        const category = await CafeCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({ success: true, data: category });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCafeCategory = async (req, res) => {po
    try {

        const duplicate = await CafeCategory.findOne({
            name: req.body.name.trim(),
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const updated = await CafeCategory.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Cafe Category updated...!",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCafeCategory = async (req, res) => {
    try {
        const deleted = await CafeCategory.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Cafe Category deleted successfully..!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

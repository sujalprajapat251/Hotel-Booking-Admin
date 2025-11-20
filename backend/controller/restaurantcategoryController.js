const RestaurantCategory = require('../models/restaurantcategoryModel');

exports.createRestaurantCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const existing = await RestaurantCategory.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const category = await RestaurantCategory.create({ name });

        return res.status(201).json({
            success: true,
            message: "Restaurant Category created successfully..!",
            data: category
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllRestaurantCategories = async (req, res) => {
    try {
        const categories = await RestaurantCategory.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleRestaurantCategory = async (req, res) => {
    try {
        const category = await RestaurantCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({ success: true, data: category });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRestaurantCategory = async (req, res) => {
    try {

        const duplicate = await RestaurantCategory.findOne({
            name: req.body.name.trim(),
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

            const updated = await RestaurantCategory.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant Category updated...!",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteRestaurantCategory = async (req, res) => {
    try {
        const deleted = await RestaurantCategory.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant Category deleted successfully..!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

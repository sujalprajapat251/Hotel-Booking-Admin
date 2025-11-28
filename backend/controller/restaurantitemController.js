const RestaurantItem = require("../models/restaurantitemModel");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service");

exports.createRestaurantItem = async (req, res) => {
    try {
        const { name, category, price, description } = req.body;

        if (!name || !category || !price || !description) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const existing = await RestaurantItem.findOne({ name: name.trim() });
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


        const item = await RestaurantItem.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Restaurant Item created..!",
            data: item
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllRestaurantItems = async (req, res) => {
    try {
        const items = await RestaurantItem.find().populate("category").sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            data: items
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleRestaurantItem = async (req, res) => {
    try {
        const item = await RestaurantItem.findById(req.params.id).populate("category");

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        return res.status(200).json({ success: true, data: item });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRestaurantItem = async (req, res) => {
    try {
        const name = req.body?.name?.trim();
        const duplicate = await RestaurantItem.findOne({
            name: name,
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Item name already exists"
            });
        }

        const item = await RestaurantItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }
        if (req.file) {
            if (item.image) await deleteFromS3(item.image);
            const uploadedUrl = await uploadToS3(req.file, "uploads/image");
            req.body.image = uploadedUrl;
        }

        const updated = await RestaurantItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Restaurant Item updated..!",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteRestaurantItem = async (req, res) => {
    try {
        const item = await RestaurantItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }
        if (item.image) {
            await deleteFromS3(item.image);
        }
        await RestaurantItem.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Restaurant Item deleted ..!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.changeAvailabilityRestaurantItem = async (req, res) => {
    try {
        const item = await RestaurantItem.findById(req.params.id);

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

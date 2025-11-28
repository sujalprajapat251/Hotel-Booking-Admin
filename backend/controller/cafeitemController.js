const CafeItem = require("../models/cafeitemModel");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service");

exports.createCafeItem = async (req, res) => {
    try {
        const { name, category, price, description } = req.body;

        if (!name || !category || !price || !description) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const existing = await CafeItem.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Item name already exists"
            });
        }

        let uploadedUrl = null;
        if (req.file) {
            uploadedUrl = await uploadToS3(req.file, "uploads/image");
        }

        const itemData = {
            name,
            category,
            price,
            description,
            image: uploadedUrl ? uploadedUrl : null
        };

        const item = await CafeItem.create(itemData);

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
        const items = await CafeItem.find().populate("category").sort({ createdAt: -1 })

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
        const name = req.body?.name?.trim();
        const duplicate = await CafeItem.findOne({
            name: name,
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Item name already exists"
            });
        }

        const item = await CafeItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }


        if (req.file) {
            if (item.image) await deleteFromS3(item.image);
            const uploadedUrl = await uploadToS3(req.file, "uploads/image");
            req.body.image = uploadedUrl;
        }

        const updated = await CafeItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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
        const item = await CafeItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (item.image) {
            await deleteFromS3(item.image);
        }

        await CafeItem.findByIdAndDelete(req.params.id);

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
            message: "Availability updated..!",
            data: item
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

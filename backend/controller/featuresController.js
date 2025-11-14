const Feature = require('../models/featuresModel');

const formatFeature = (doc) => ({
    id: doc._id,
    feature: doc.feature,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
});

const createFeature = async (req, res) => {
    try {
        const { feature } = req.body;

        if (!feature || !feature.trim()) {
            return res.status(400).json({ success: false, message: 'feature is required' });
        }

        const trimmed = feature.trim();

        const existing = await Feature.findOne({ feature: trimmed });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Feature already exists' });
        }

        const created = await Feature.create({ feature: trimmed });
        return res.status(201).json({
            success: true,
            message: 'Feature created successfully',
            data: formatFeature(created)
        });
    } catch (error) {
        console.error('createFeature error:', error);
        res.status(500).json({ success: false, message: 'Failed to create feature' });
    }
};

const getFeatures = async (_req, res) => {
    try {
        const list = await Feature.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: list.map(formatFeature)
        });
    } catch (error) {
        console.error('getFeatures error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch features' });
    }
};

const getFeatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Feature.findById(id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Feature not found' });
        }

        res.json({ success: true, data: formatFeature(doc) });
    } catch (error) {
        console.error('getFeatureById error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch feature' });
    }
};

const updateFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const { feature } = req.body;

        if (!feature || !feature.trim()) {
            return res.status(400).json({ success: false, message: 'feature is required' });
        }

        const updated = await Feature.findByIdAndUpdate(
            id,
            { feature: feature.trim() },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Feature not found' });
        }

        res.json({
            success: true,
            message: 'Feature updated successfully',
            data: formatFeature(updated)
        });
    } catch (error) {
        console.error('updateFeature error:', error);
        res.status(500).json({ success: false, message: 'Failed to update feature' });
    }
};

const deleteFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Feature.findByIdAndDelete(id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Feature not found' });
        }

        res.json({
            success: true,
            message: 'Feature deleted successfully',
            data: formatFeature(doc)
        });
    } catch (error) {
        console.error('deleteFeature error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete feature' });
    }
};

module.exports = {
    createFeature,
    getFeatures,
    getFeatureById,
    updateFeature,
    deleteFeature
};


const Feature = require('../models/featuresModel');
const RoomType = require('../models/roomtypeModel');

const formatFeature = (doc) => ({
    id: doc._id,
    feature: doc.feature,
    roomType: doc.roomType,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
});

const createFeature = async (req, res) => {
    try {
        const { feature, roomType } = req.body;

        if (!feature || !feature.trim()) {
            return res.status(400).json({ success: false, message: 'feature is required' });
        }

        if (!roomType) {
            return res.status(400).json({ success: false, message: 'roomType is required' });
        }

        const trimmed = feature.trim();

        // Verify room type exists
        const roomTypeExists = await RoomType.findById(roomType);
        if (!roomTypeExists) {
            return res.status(404).json({ success: false, message: 'Room type not found' });
        }

        // Check if feature already exists for this room type
        const existing = await Feature.findOne({ feature: trimmed, roomType });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Feature already exists for this room type' });
        }

        const created = await Feature.create({ feature: trimmed, roomType });
        const populated = await Feature.findById(created._id).populate('roomType', 'roomType');
        
        return res.status(201).json({
            success: true,
            message: 'Feature created successfully',
            data: formatFeature(populated)
        });
    } catch (error) {
        console.error('createFeature error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Feature already exists for this room type' });
        }
        res.status(500).json({ success: false, message: 'Failed to create feature', error: error.message });
    }
};

const getFeatures = async (req, res) => {
    try {
        const { roomType } = req.query;
        let query = {};
        
        if (roomType) {
            query.roomType = roomType;
        }
        
        const list = await Feature.find(query)
            .populate('roomType', 'roomType')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: list.map(formatFeature)
        });
    } catch (error) {
        console.error('getFeatures error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch features' });
    }
};

const getFeaturesByRoomType = async (req, res) => {
    try {
        const { roomTypeId } = req.params;
        
        const list = await Feature.find({ roomType: roomTypeId })
            .populate('roomType', 'roomType')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: list.map(formatFeature)
        });
    } catch (error) {
        console.error('getFeaturesByRoomType error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch features' });
    }
};

const getFeatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Feature.findById(id).populate('roomType', 'roomType');

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
        const { feature, roomType } = req.body;

        if (!feature || !feature.trim()) {
            return res.status(400).json({ success: false, message: 'feature is required' });
        }

        const updateData = { feature: feature.trim() };
        
        if (roomType) {
            // Verify room type exists
            const roomTypeExists = await RoomType.findById(roomType);
            if (!roomTypeExists) {
                return res.status(404).json({ success: false, message: 'Room type not found' });
            }
            updateData.roomType = roomType;
        }

        const updated = await Feature.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('roomType', 'roomType');

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
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Feature already exists for this room type' });
        }
        res.status(500).json({ success: false, message: 'Failed to update feature', error: error.message });
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
    getFeaturesByRoomType,
    getFeatureById,
    updateFeature,
    deleteFeature
};


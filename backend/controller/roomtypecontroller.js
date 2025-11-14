const RoomType = require('../models/roomtypeModel');

const formatRoomType = (doc) => ({
    id: doc._id,
    roomType: doc.roomType,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
});

const createRoomType = async (req, res) => {
    try {
        const { roomType } = req.body;

        if (!roomType || !roomType.trim()) {
            return res.status(400).json({ success: false, message: 'roomType is required' });
        }

        const existing = await RoomType.findOne({ roomType: roomType.trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Room type already exists' });
        }

        const created = await RoomType.create({ roomType: roomType.trim() });
        return res.status(201).json({
            success: true,
            message: 'Room type created successfully',
            data: formatRoomType(created)
        });
    } catch (error) {
        console.error('createRoomType error:', error);
        res.status(500).json({ success: false, message: 'Failed to create room type' });
    }
};

const getRoomTypes = async (_req, res) => {
    try {
        const list = await RoomType.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: list.map(formatRoomType)
        });
    } catch (error) {
        console.error('getRoomTypes error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch room types' });
    }
};

const getRoomTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await RoomType.findById(id);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Room type not found' });
        }

        res.json({ success: true, data: formatRoomType(doc) });
    } catch (error) {
        console.error('getRoomTypeById error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch room type' });
    }
};

const updateRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomType } = req.body;

        if (!roomType || !roomType.trim()) {
            return res.status(400).json({ success: false, message: 'roomType is required' });
        }

        const updated = await RoomType.findByIdAndUpdate(
            id,
            { roomType: roomType.trim() },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Room type not found' });
        }

        res.json({
            success: true,
            message: 'Room type updated successfully',
            data: formatRoomType(updated)
        });
    } catch (error) {
        console.error('updateRoomType error:', error);
        res.status(500).json({ success: false, message: 'Failed to update room type' });
    }
};

const deleteRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await RoomType.findByIdAndDelete(id);

        if (!doc) {
            return res.status(404).json({ success: false, message: 'Room type not found' });
        }

        res.json({
            success: true,
            message: 'Room type deleted successfully',
            data: formatRoomType(doc)
        });
    } catch (error) {
        console.error('deleteRoomType error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete room type' });
    }
};

module.exports = {
    createRoomType,
    getRoomTypes,
    getRoomTypeById,
    updateRoomType,
    deleteRoomType
};


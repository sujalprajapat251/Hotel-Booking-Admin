const RoomType = require('../models/roomtypeModel');
const Room = require('../models/createRoomModel');
const Review = require('../models/reviewModel');
const { uploadToS3 } = require('../utils/s3Service');

const formatRoomType = (doc, availability = null) => ({
    id: doc._id,
    roomType: doc.roomType,
    description: doc.description,
    price: doc.price,
    images: doc.images || [],
    capacity: doc.capacity,
    features: doc.features || [],
    availableRooms: availability?.available ?? doc.availableRooms,
    bed: doc.bed,
    totalRooms: availability?.total ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
});

const createRoomType = async (req, res) => {
    try {
        const {
            roomType,
            description = '',
            price,
            availableRooms,
            capacityAdults,
            capacityChildren = 0,
            features,
            bed
        } = req.body;

        if (!roomType || !roomType.trim()) {
            return res.status(400).json({ success: false, message: 'roomType is required' });
        }

        const numericPrice = Number(price);
        const numericAvailableRooms = Number(availableRooms);
        const numericAdults = Number(capacityAdults);
        const numericChildren = Number(capacityChildren ?? 0);

        if (Number.isNaN(numericPrice)) {
            return res.status(400).json({ success: false, message: 'price is required and must be a number' });
        }

        if (Number.isNaN(numericAvailableRooms)) {
            return res.status(400).json({ success: false, message: 'availableRooms is required and must be a number' });
        }

        if (Number.isNaN(numericAdults) || numericAdults < 1) {
            return res.status(400).json({ success: false, message: 'capacityAdults is required and must be at least 1' });
        }

        if (Number.isNaN(numericChildren) || numericChildren < 0) {
            return res.status(400).json({ success: false, message: 'capacityChildren must be 0 or more' });
        }

        let featureList = [];
        if (features !== undefined) {
            try {
                const parsed = typeof features === 'string' ? JSON.parse(features) : features;
                if (Array.isArray(parsed)) {
                    featureList = parsed.filter(Boolean).map((f) => f.toString().trim()).filter(Boolean);
                }
            } catch (err) {
                return res.status(400).json({ success: false, message: 'features must be an array or JSON string' });
            }
        }

        const existing = await RoomType.findOne({ roomType: roomType.trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Room type already exists' });
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await uploadToS3(file, 'uploads/roomtypes');
                imageUrls.push(uploaded);
            }
        }

        // Parse and validate bed data if it's a string
        let bedData = bed;
        if (typeof bed === 'string') {
            try {
                bedData = JSON.parse(bed);
            } catch (err) {
                return res.status(400).json({ success: false, message: 'bed must be a valid JSON string' });
            }
        }

        // Validate bed data
        if (bedData) {
            if (!bedData.mainBed || !bedData.mainBed.type || bedData.mainBed.count === undefined) {
                return res.status(400).json({ success: false, message: 'mainBed type and count are required' });
            }
            const mainBedCount = Number(bedData.mainBed.count);
            if (mainBedCount < 1) {
                return res.status(400).json({ success: false, message: 'mainBed count must be at least 1' });
            }
            // childBed is optional
            if (bedData.childBed && bedData.childBed.count !== undefined) {
                const childBedCount = Number(bedData.childBed.count);
                if (childBedCount < 0) {
                    return res.status(400).json({ success: false, message: 'childBed count must be 0 or more' });
                }
            }
        } else {
            return res.status(400).json({ success: false, message: 'bed configuration is required' });
        }

        const created = await RoomType.create({
            roomType: roomType.trim(),
            description: description.trim(),
            price: numericPrice,
            availableRooms: numericAvailableRooms,
            images: imageUrls,
            capacity: {
                adults: numericAdults,
                children: numericChildren
            },
            features: featureList,
            bed: bedData
        });
        
        const populated = await RoomType.findById(created._id)
            .populate('features', 'feature');
        
        return res.status(201).json({
            success: true,
            message: 'Room type created successfully',
            data: formatRoomType(populated)
        });
    } catch (error) {
        console.error('createRoomType error:', error);
        res.status(500).json({ success: false, message: 'Failed to create room type' });
    }
};

const getRoomTypes = async (_req, res) => {
    try {
        const list = await RoomType.find()
            .populate('features', 'feature')
            .sort({ createdAt: -1 });

        // 🔹 Availability aggregation
        const availabilityAgg = await Room.aggregate([
            {
                $group: {
                    _id: '$roomType',
                    total: { $sum: 1 },
                    available: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'Available'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const availabilityMap = availabilityAgg.reduce((acc, item) => {
            acc[item._id?.toString()] = {
                available: item.available,
                total: item.total
            };
            return acc;
        }, {});

        // 🔹 Rating aggregation
        const reviewAgg = await Review.aggregate([
            { $match: { reviewType: "room" } },
            {
                $lookup: {
                    from: "rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    as: "room"
                }
            },
            { $unwind: "$room" },
            {
                $group: {
                    _id: "$room.roomType",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $project: {
                    averageRating: { $round: ["$averageRating", 1] },
                    totalReviews: 1
                }
            }
        ]);

        const reviewMap = reviewAgg.reduce((acc, item) => {
            acc[item._id.toString()] = {
                average: item.averageRating,
                totalReviews: item.totalReviews
            };
            return acc;
        }, {});

        res.json({
            success: true,
            data: list.map((doc) => ({
                ...doc.toObject(),
                availability: availabilityMap[doc._id.toString()] || {
                    available: 0,
                    total: 0
                },
                rating: reviewMap[doc._id.toString()] || {
                    average: 0,
                    totalReviews: 0
                }
            }))
        });

    } catch (error) {
        console.error('getRoomTypes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch room types'
        });
    }
};


const getRoomTypeById = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await RoomType.findById(id)
            .populate('features', 'feature');

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Room type not found'
            });
        }

        // 🔹 Availability aggregation (ONLY this room type)
        const availabilityAgg = await Room.aggregate([
            { $match: { roomType: doc._id } },
            {
                $group: {
                    _id: '$roomType',
                    total: { $sum: 1 },
                    available: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'Available'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const availability =
            availabilityAgg.length > 0
                ? {
                    available: availabilityAgg[0].available,
                    total: availabilityAgg[0].total
                }
                : { available: 0, total: 0 };

        // 🔹 Rating aggregation (same as getRoomTypes)
        const reviewAgg = await Review.aggregate([
            { $match: { reviewType: "room" } },
            {
                $lookup: {
                    from: "rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    as: "room"
                }
            },
            { $unwind: "$room" },
            { $match: { "room.roomType": doc._id } },
            {
                $group: {
                    _id: "$room.roomType",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $project: {
                    averageRating: { $round: ["$averageRating", 1] },
                    totalReviews: 1
                }
            }
        ]);

        const rating =
            reviewAgg.length > 0
                ? {
                    average: reviewAgg[0].averageRating,
                    totalReviews: reviewAgg[0].totalReviews
                }
                : { average: 0, totalReviews: 0 };

        res.json({
            success: true,
            data: {
                ...doc.toObject(),
                availability,
                rating
            }
        });

    } catch (error) {
        console.error('getRoomTypeById error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch room type'
        });
    }
};


const updateRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            roomType,
            description,
            price,
            availableRooms,
            capacityAdults,
            capacityChildren,
            features,
            bed,
            existingImages
        } = req.body;

        const updates = {};

        if (roomType !== undefined) {
            if (!roomType.trim()) {
                return res.status(400).json({ success: false, message: 'roomType is required' });
            }
            updates.roomType = roomType.trim();
        }

        if (description !== undefined) {
            updates.description = description.trim();
        }

        if (price !== undefined) {
            const numericPrice = Number(price);
            if (Number.isNaN(numericPrice)) {
                return res.status(400).json({ success: false, message: 'price must be a number' });
            }
            updates.price = numericPrice;
        }

        if (availableRooms !== undefined) {
            const numericAvailableRooms = Number(availableRooms);
            if (Number.isNaN(numericAvailableRooms)) {
                return res.status(400).json({ success: false, message: 'availableRooms must be a number' });
            }
            updates.availableRooms = numericAvailableRooms;
        }

        if (capacityAdults !== undefined || capacityChildren !== undefined) {
            const numericAdults = capacityAdults !== undefined ? Number(capacityAdults) : undefined;
            const numericChildren = capacityChildren !== undefined ? Number(capacityChildren) : undefined;

            if (numericAdults !== undefined && (Number.isNaN(numericAdults) || numericAdults < 1)) {
                return res.status(400).json({ success: false, message: 'capacityAdults must be at least 1' });
            }
            if (numericChildren !== undefined && (Number.isNaN(numericChildren) || numericChildren < 0)) {
                return res.status(400).json({ success: false, message: 'capacityChildren must be 0 or more' });
            }

            const capacityUpdate = {};
            if (numericAdults !== undefined) capacityUpdate.adults = numericAdults;
            if (numericChildren !== undefined) capacityUpdate.children = numericChildren;
            if (Object.keys(capacityUpdate).length > 0) {
                updates.capacity = capacityUpdate;
            }
        }

        if (features !== undefined) {
            try {
                const parsed = typeof features === 'string' ? JSON.parse(features) : features;
                if (!Array.isArray(parsed)) {
                    return res.status(400).json({ success: false, message: 'features must be an array' });
                }
                updates.features = parsed.filter(Boolean).map((f) => f.toString().trim()).filter(Boolean);
            } catch (err) {
                return res.status(400).json({ success: false, message: 'features must be an array or JSON string' });
            }
        }

        if (bed !== undefined) {
            try {
                const parsedBed = typeof bed === 'string' ? JSON.parse(bed) : bed;
                if (parsedBed && typeof parsedBed === 'object') {
                    // Validate and set bed data
                    const bedUpdate = {};
                    if (parsedBed.mainBed && parsedBed.mainBed.type && parsedBed.mainBed.count !== undefined) {
                        const mainBedCount = Number(parsedBed.mainBed.count);
                        if (mainBedCount >= 1) {
                            bedUpdate.mainBed = {
                                type: parsedBed.mainBed.type.trim(),
                                count: mainBedCount
                            };
                        } else {
                            return res.status(400).json({ success: false, message: 'mainBed count must be at least 1' });
                        }
                    }
                    // childBed is optional - only include if provided and valid
                    if (parsedBed.childBed) {
                        if (parsedBed.childBed.type && parsedBed.childBed.count !== undefined) {
                            const childBedCount = Number(parsedBed.childBed.count);
                            if (childBedCount >= 0) {
                                bedUpdate.childBed = {
                                    type: parsedBed.childBed.type.trim(),
                                    count: childBedCount
                                };
                            }
                        }
                    }
                    // Only update bed if mainBed is provided (required)
                    if (bedUpdate.mainBed) {
                        updates.bed = bedUpdate;
                    } else if (parsedBed.mainBed) {
                        return res.status(400).json({ success: false, message: 'mainBed type and count are required' });
                    }
                }
            } catch (err) {
                return res.status(400).json({ success: false, message: 'bed must be a valid object or JSON string' });
            }
        }

        // Handle images: merge existing images with new uploads
        if (req.files && req.files.length > 0) {
            const uploads = [];
            for (const file of req.files) {
                const uploaded = await uploadToS3(file, 'uploads/roomtypes');
                uploads.push(uploaded);
            }
            
            // If existingImages is provided, merge with new uploads
            if (existingImages !== undefined) {
                try {
                    const parsedExisting = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
                    if (Array.isArray(parsedExisting)) {
                        // Merge existing images with new uploads
                        updates.images = [...parsedExisting, ...uploads];
                    } else {
                        // If existingImages is not a valid array, just use new uploads
                        updates.images = uploads;
                    }
                } catch (err) {
                    // If parsing fails, just use new uploads
                    updates.images = uploads;
                }
            } else {
                // No existing images specified, replace all with new uploads
                updates.images = uploads;
            }
        } else if (existingImages !== undefined) {
            // No new files, but existing images specified (user might have only removed images)
            try {
                const parsedExisting = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
                if (Array.isArray(parsedExisting)) {
                    updates.images = parsedExisting;
                }
            } catch (err) {
                // If parsing fails, don't update images
            }
        }

        const updated = await RoomType.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
        .populate('features', 'feature');

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


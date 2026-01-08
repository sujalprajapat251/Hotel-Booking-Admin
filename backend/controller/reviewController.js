const Review = require('../models/reviewModel');
const Room = require('../models/createRoomModel');

// Create a new review
const createReview = async (req, res) => {
    try {
        const { rating, title, comment, reviewType, userId, roomId } = req.body;

        const review = new Review({
            rating,
            title,
            comment,
            reviewType,
            userId,
            roomId
        });

        const savedReview = await review.save();

        // attach this review to the corresponding room document
        if (reviewType === 'room' && roomId) {
            await Room.findByIdAndUpdate(
                roomId,
                { $push: { reviews: savedReview._id } },
                { new: true }
            );
        }
        return res.status(201).json({
            success: true,
            message: 'Review submit successfully..!',
            data: savedReview
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
};

// Get all reviews 
const getAllReviews = async (req, res) => {
    try {
        const { reviewType, roomId } = req.query;
        const filter = {};

        if (reviewType) {
            filter.reviewType = reviewType;
        }

        if (roomId) {
            filter.roomId = roomId;
        }

        const reviews = await Review.find(filter).sort({ updatedAt: -1 })
            .populate({
                path: "userId",
                select: "name email photo"
            })
            .populate({
                path: "roomId",
                populate: {
                    path: "roomType",        
                    model: "roomType",
                }
            });

        return res.status(200).json({
            success: true,
            message: 'Reviews fetched successfully',
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// Get single review by id
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id)
            .populate('userId', 'name email')
            .populate('roomId');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Review fetched successfully',
            data: review
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch review',
            error: error.message
        });
    }
};

const getReviewStatsByType = async (req, res) => {
    try {
        const stats = await Review.aggregate([
            {
                // optional filter (only cafe, bar, restaurant)
                $match: {
                    reviewType: { $in: ['cafe', 'bar', 'restaurant'] }
                }
            },
            {
                $group: {
                    _id: "$reviewType",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 1,
                    averageRating: { $round: ["$averageRating", 1] },
                    totalReviews: 1
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Review statistics fetched successfully",
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch review stats",
            error: error.message
        });
    }
};

module.exports = {
    createReview,
    getAllReviews,
    getReviewById,
    getReviewStatsByType
};



const Review = require('../models/reviewModel');
const Room = require('../models/createRoomModel');

// Create a new review
const createReview = async (req, res) => {
    try {
        const { rating, title, comment, reviewType, userId, roomId, bookingId } = req.body;

        const review = new Review({
            rating,
            title,
            comment,
            reviewType,
            userId,
            // Only save roomId if reviewType is 'room'
            ...(reviewType === 'room' && roomId && { roomId }),
            bookingId
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

        // If you want to show the full room details in the response:
        if (savedReview.roomId) {
            await savedReview.populate({
                path: "roomId",
                populate: {
                    path: "roomType",
                    model: "roomType",
                }
            });
        }

        if (savedReview.bookingId) {
            await savedReview.populate("bookingId", "roomNumber status");
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
        const { reviewType, roomId, bookingId } = req.query;
        const filter = {};

        if (reviewType) {
            filter.reviewType = reviewType;
        }

        if (roomId) {
            filter.roomId = roomId;
        }

        if (bookingId) {
            filter.bookingId = bookingId;
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
            })
            .populate("bookingId", "roomNumber status");

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
            .populate('roomId')
            .populate('bookingId', 'roomNumber status');

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
                    reviewType: { $in: ['room', 'cafe', 'bar', 'restaurant'] }
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

// Update a review
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment, reviewType, roomId, bookingId } = req.body;

        const existingReview = await Review.findById(id);
        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const updateData = { rating, title, comment };
        if (reviewType) {
            updateData.reviewType = reviewType;
        }

        const finalReviewType = reviewType || existingReview.reviewType;
        let updateQuery = { $set: updateData };

        if (finalReviewType === 'room') {
            if (roomId) updateQuery.$set.roomId = roomId;
            if (bookingId) updateQuery.$set.bookingId = bookingId;
        } else {
            updateQuery.$unset = { roomId: 1, bookingId: 1 };
        }

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        );

        // Manage Room's reviews array
        if (existingReview.reviewType === 'room' && existingReview.roomId) {
            // Remove from the old room if the review type changed, or if the roomId changed to a new one
            if (finalReviewType !== 'room' || (roomId && existingReview.roomId.toString() !== roomId.toString())) {
                await Room.findByIdAndUpdate(
                    existingReview.roomId,
                    { $pull: { reviews: id } }
                );
            }
        }

        if (finalReviewType === 'room' && roomId) {
            // Add to the new room if the review type just became 'room', or it didn't have a room, or the room changed
            if (existingReview.reviewType !== 'room' || !existingReview.roomId || existingReview.roomId.toString() !== roomId.toString()) {
                await Room.findByIdAndUpdate(
                    roomId,
                    { $push: { reviews: id } },
                    { new: true }
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: updatedReview
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // If it's a room review, remove its ID from the room document
        if (review.reviewType === 'room' && review.roomId) {
            await Room.findByIdAndUpdate(
                review.roomId,
                { $pull: { reviews: id } }
            );
        }

        await Review.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

// Get all reviews by user id
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookingId } = req.query;
        const filter = { userId };
        if (bookingId) filter.bookingId = bookingId;

        const reviews = await Review.find(filter).sort({ updatedAt: -1 })
            .populate({
                path: "roomId",
                populate: {
                    path: "roomType",
                    model: "roomType",
                }
            })
            .populate("bookingId", "roomNumber status");

        return res.status(200).json({
            success: true,
            message: 'User reviews fetched successfully',
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user reviews',
            error: error.message
        });
    }
};

// Get user review by bookingId
const getUserReviewForBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookingId } = req.params;

        const reviews = await Review.find({ userId, bookingId })
            .populate({
                path: "roomId",
                populate: {
                    path: "roomType",
                    model: "roomType",
                }
            })
            .populate("bookingId", "roomNumber status");

        if (!reviews || reviews.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No review found for this booking',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User booking reviews fetched successfully',
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user review for booking',
            error: error.message
        });
    }
};

// Update user review by bookingId
const updateUserReviewForBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookingId } = req.params;
        const { rating, title, comment } = req.body;

        const updatedReview = await Review.findOneAndUpdate(
            { userId, bookingId },
            { rating, title, comment },
            { new: true }
        ).populate({
            path: "roomId",
            populate: {
                path: "roomType",
                model: "roomType",
            }
        }).populate("bookingId", "roomNumber status");

        if (!updatedReview) {
            return res.status(404).json({
                success: false,
                message: 'No review found for this booking to update'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User booking review updated successfully',
            data: updatedReview
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update user review for booking',
            error: error.message
        });
    }
};

// Get user Cafe review by bookingId
const getUserCafeReviewByBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookingId } = req.params;

        const review = await Review.findOne({ userId, bookingId, reviewType: 'cafe' })
            .populate("bookingId", "roomNumber status");

        return res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user cafe review',
            error: error.message
        });
    }
};

// Get user Bar review by bookingId
const getUserBarReviewByBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookingId } = req.params;

        const review = await Review.findOne({ userId, bookingId, reviewType: 'bar' })
            .populate("bookingId", "roomNumber status");

        return res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user bar review',
            error: error.message
        });
    }
};

// Get user Restaurant review by bookingId
const getUserRestaurantReviewByBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bookingId } = req.params;

        const review = await Review.findOne({ userId, bookingId, reviewType: 'restaurant' })
            .populate("bookingId", "roomNumber status");

        return res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user restaurant review',
            error: error.message
        });
    }
};

module.exports = {
    createReview,
    getAllReviews,
    getReviewById,
    getReviewStatsByType,
    updateReview,
    deleteReview,
    getUserReviews,
    getUserReviewForBooking,
    updateUserReviewForBooking,
    getUserCafeReviewByBooking,
    getUserBarReviewByBooking,
    getUserRestaurantReviewByBooking
};



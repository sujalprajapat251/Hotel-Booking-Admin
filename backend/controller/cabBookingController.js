const CabBooking = require("../models/cabBookingModel");
const Booking = require("../models/bookingModel");
const Cab = require("../models/cabModel");
const Driver = require("../models/driverModel");

// Create Cab Booking
exports.createCabBooking = async (req, res) => {
    try {
        const {
            bookingId,
            pickUpLocation,
            dropLocation,
            assignedCab,
            assignedDriver,
            bookingDate,
            pickUpTime,
            estimatedDistance,
            estimatedFare,
            specialInstructions,
            notes
        } = req.body;
        // Validate required fields
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        if (!pickUpLocation) {
            return res.status(400).json({
                success: false,
                message: "Pick-up location with address is required"
            });
        }

        if (!pickUpTime) {
            return res.status(400).json({
                success: false,
                message: "Pick-up time is required"
            });
        }

        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Verify cab exists if assigned
        if (assignedCab) {
            const cab = await Cab.findById(assignedCab);
            if (!cab) {
                return res.status(404).json({
                    success: false,
                    message: "Cab not found"
                });
            }
        }

        // Verify driver exists if assigned
        if (assignedDriver) {
            const driver = await Driver.findById(assignedDriver);
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: "Driver not found"
                });
            }
        }

        // Set default drop location to hotel if not provided
        const finalDropLocation = dropLocation || {
            address: "Hotel",
            city: "",
            state: "",
            zipCode: ""
        };

        const newCabBooking = await CabBooking.create({
            booking: bookingId,
            pickUpLocation,
            dropLocation: finalDropLocation,
            assignedCab: assignedCab || null,
            assignedDriver: assignedDriver || null,
            bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
            pickUpTime: new Date(pickUpTime),
            estimatedDistance: estimatedDistance || null,
            estimatedFare: estimatedFare || null,
            specialInstructions: specialInstructions || "",
            notes: notes || ""
        });

        const populatedBooking = await newCabBooking.populate([
            {
                path: "booking",
                select: "guest reservation roomNumber status",
                populate: {
                    path: "room",
                    select: "roomNumber roomType"
                }
            },
            {
                path: "assignedCab",
                select: "vehicleId modelName registrationNumber seatingCapacity perKmCharge"
            },
            {
                path: "assignedDriver",
                select: "name email mobileno"
            }
        ]);

        res.status(201).json({
            success: true,
            message: "Cab booking created successfully",
            data: populatedBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Cab Bookings
exports.getAllCabBookings = async (req, res) => {
    try {
        const {
            status,
            paymentStatus,
            bookingId,
            assignedCab,
            assignedDriver,
            dateFrom,
            dateTo,
            search
        } = req.query;

        const filter = {};

        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (bookingId) filter.booking = bookingId;
        if (assignedCab) filter.assignedCab = assignedCab;
        if (assignedDriver) filter.assignedDriver = assignedDriver;

        if (dateFrom || dateTo) {
            filter.bookingDate = {};
            if (dateFrom) filter.bookingDate.$gte = new Date(dateFrom);
            if (dateTo) filter.bookingDate.$lte = new Date(dateTo);
        }

        // Search functionality
        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { 'pickUpLocation.address': regex },
                { 'dropLocation.address': regex },
                { specialInstructions: regex },
                { notes: regex }
            ];
        }

        const cabBookings = await CabBooking.find(filter)
            .populate({
                path: "booking",
                select: "guest reservation roomNumber status",
                populate: {
                    path: "room",
                    select: "roomNumber roomType"
                }
            })
            .populate({
                path: "assignedCab",
                select: "vehicleId modelName registrationNumber seatingCapacity perKmCharge"
            })
            .populate({
                path: "assignedDriver",
                select: "name email mobileno"
            })
            .sort({ bookingDate: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: cabBookings.length,
            data: cabBookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Cab Booking By ID
exports.getCabBookingById = async (req, res) => {
    try {
        const cabBooking = await CabBooking.findById(req.params.id)
            .populate({
                path: "booking",
                select: "guest reservation roomNumber status",
                populate: {
                    path: "room",
                    select: "roomNumber roomType"
                }
            })
            .populate({
                path: "assignedCab",
                select: "vehicleId modelName registrationNumber seatingCapacity perKmCharge cabImage"
            })
            .populate({
                path: "assignedDriver",
                select: "name email mobileno image"
            });

        if (!cabBooking) {
            return res.status(404).json({
                success: false,
                message: "Cab booking not found"
            });
        }

        res.status(200).json({
            success: true,
            data: cabBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Cab Booking
exports.updateCabBooking = async (req, res) => {
    try {
        const {
            pickUpLocation,
            dropLocation,
            assignedCab,
            assignedDriver,
            bookingDate,
            pickUpTime,
            estimatedDistance,
            estimatedFare,
            status,
            paymentStatus,
            specialInstructions,
            notes
        } = req.body;

        const cabBooking = await CabBooking.findById(req.params.id);

        if (!cabBooking) {
            return res.status(404).json({
                success: false,
                message: "Cab booking not found"
            });
        }

        // Update fields if provided
        if (pickUpLocation) {
            if (pickUpLocation.address) cabBooking.pickUpLocation.address = pickUpLocation.address;
            if (pickUpLocation.city !== undefined) cabBooking.pickUpLocation.city = pickUpLocation.city;
            if (pickUpLocation.state !== undefined) cabBooking.pickUpLocation.state = pickUpLocation.state;
            if (pickUpLocation.zipCode !== undefined) cabBooking.pickUpLocation.zipCode = pickUpLocation.zipCode;
            if (pickUpLocation.coordinates) {
                if (pickUpLocation.coordinates.latitude !== undefined) {
                    cabBooking.pickUpLocation.coordinates.latitude = pickUpLocation.coordinates.latitude;
                }
                if (pickUpLocation.coordinates.longitude !== undefined) {
                    cabBooking.pickUpLocation.coordinates.longitude = pickUpLocation.coordinates.longitude;
                }
            }
        }

        if (dropLocation) {
            if (dropLocation.address !== undefined) cabBooking.dropLocation.address = dropLocation.address;
            if (dropLocation.city !== undefined) cabBooking.dropLocation.city = dropLocation.city;
            if (dropLocation.state !== undefined) cabBooking.dropLocation.state = dropLocation.state;
            if (dropLocation.zipCode !== undefined) cabBooking.dropLocation.zipCode = dropLocation.zipCode;
            if (dropLocation.coordinates) {
                if (dropLocation.coordinates.latitude !== undefined) {
                    cabBooking.dropLocation.coordinates.latitude = dropLocation.coordinates.latitude;
                }
                if (dropLocation.coordinates.longitude !== undefined) {
                    cabBooking.dropLocation.coordinates.longitude = dropLocation.coordinates.longitude;
                }
            }
        }

        if (assignedCab !== undefined) {
            if (assignedCab) {
                const cab = await Cab.findById(assignedCab);
                if (!cab) {
                    return res.status(404).json({
                        success: false,
                        message: "Cab not found"
                    });
                }
            }
            cabBooking.assignedCab = assignedCab || null;
        }

        if (assignedDriver !== undefined) {
            if (assignedDriver) {
                const driver = await Driver.findById(assignedDriver);
                if (!driver) {
                    return res.status(404).json({
                        success: false,
                        message: "Driver not found"
                    });
                }
            }
            cabBooking.assignedDriver = assignedDriver || null;
        }

        if (bookingDate) cabBooking.bookingDate = new Date(bookingDate);
        if (pickUpTime) cabBooking.pickUpTime = new Date(pickUpTime);
        if (estimatedDistance !== undefined) cabBooking.estimatedDistance = estimatedDistance;
        if (estimatedFare !== undefined) cabBooking.estimatedFare = estimatedFare;
        if (status) cabBooking.status = status;
        if (paymentStatus) cabBooking.paymentStatus = paymentStatus;
        if (specialInstructions !== undefined) cabBooking.specialInstructions = specialInstructions;
        if (notes !== undefined) cabBooking.notes = notes;

        await cabBooking.save();

        const populatedBooking = await cabBooking.populate([
            {
                path: "booking",
                select: "guest reservation roomNumber status",
                populate: {
                    path: "room",
                    select: "roomNumber roomType"
                }
            },
            {
                path: "assignedCab",
                select: "vehicleId modelName registrationNumber seatingCapacity perKmCharge"
            },
            {
                path: "assignedDriver",
                select: "name email mobileno"
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Cab booking updated successfully",
            data: populatedBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Cab Booking
exports.deleteCabBooking = async (req, res) => {
    try {
        const cabBooking = await CabBooking.findByIdAndDelete(req.params.id);

        if (!cabBooking) {
            return res.status(404).json({
                success: false,
                message: "Cab booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cab booking deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Cab Bookings by Booking ID (to get all cab bookings for a specific hotel booking)
exports.getCabBookingsByBookingId = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const cabBookings = await CabBooking.find({ booking: bookingId })
            .populate({
                path: "booking",
                select: "guest reservation roomNumber status",
                populate: {
                    path: "room",
                    select: "roomNumber roomType"
                }
            })
            .populate({
                path: "assignedCab",
                select: "vehicleId modelName registrationNumber seatingCapacity perKmCharge"
            })
            .populate({
                path: "assignedDriver",
                select: "name email mobileno"
            })
            .sort({ bookingDate: -1 });

        res.status(200).json({
            success: true,
            count: cabBookings.length,
            data: cabBookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


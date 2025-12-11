const CabBooking = require("../models/cabBookingModel");
const Booking = require("../models/bookingModel");
const Cab = require("../models/cabModel");
const Staff = require("../models/staffModel");
const { findAvailableDriver, assignDriversToUnassignedBookings } = require("../utils/driverAssignment");
const { emitUserNotification } = require("../socketManager/socketManager");

const PICKUP_DISTANCE_MAP = {
    "Airport": 30,
    "Railway Station": 15,
    "Bus Station": 20
};

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
            notes,
            preferredSeatingCapacity
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

        let resolvedCabId = assignedCab || null;
        let resolvedDriverId = assignedDriver || null;

        // Auto-assign cab based on seating capacity if not manually assigned
        if (!resolvedCabId && preferredSeatingCapacity) {
            const pickUpDateTime = new Date(pickUpTime);
            
            // Find cabs that are not booked during the pick-up time
            const bookedCabIds = await CabBooking.find({
                pickUpTime: {
                    $lte: new Date(pickUpDateTime.getTime() + 2 * 60 * 60 * 1000), 
                    $gte: new Date(pickUpDateTime.getTime() - 2 * 60 * 60 * 1000)  
                },
                status: { $in: ["Pending", "Confirmed", "Assigned", "InProgress"] }
            }).distinct('assignedCab');

            // Find available cab with matching seating capacity
            const availableCab = await Cab.findOne({
                seatingCapacity: preferredSeatingCapacity,
                status: "Available",
                _id: { $nin: bookedCabIds.filter(Boolean) }
            });

            if (availableCab) {
                resolvedCabId = availableCab._id;
            } else {
                // If exact match not found, try to find a cab with equal or higher capacity
                const capacityNumber = preferredSeatingCapacity === "10+" ? 10 : parseInt(preferredSeatingCapacity);
                if (!isNaN(capacityNumber)) {
                    // Find cabs with seating capacity >= required capacity
                    const allCabs = await Cab.find({
                        status: "Available",
                        _id: { $nin: bookedCabIds.filter(Boolean) }
                    });
                    
                    // Filter cabs where seating capacity (as string) can be parsed and is >= required
                    const suitableCabs = allCabs.filter(cab => {
                        if (cab.seatingCapacity === "10+") return true;
                        const cabCapacity = parseInt(cab.seatingCapacity);
                        return !isNaN(cabCapacity) && cabCapacity >= capacityNumber;
                    }).sort((a, b) => {
                        // Sort by capacity ascending to get the smallest suitable cab
                        const aCap = a.seatingCapacity === "10+" ? 999 : parseInt(a.seatingCapacity);
                        const bCap = b.seatingCapacity === "10+" ? 999 : parseInt(b.seatingCapacity);
                        return aCap - bCap;
                    });

                    if (suitableCabs.length > 0) {
                        resolvedCabId = suitableCabs[0]._id;
                    }
                }
            }

            if (!resolvedCabId) {
                return res.status(404).json({
                    success: false,
                    message: `No available cab found with ${preferredSeatingCapacity} seater capacity or higher for the selected time`
                });
            }
        }

        // Verify cab exists if assigned
        if (resolvedCabId) {
            const cab = await Cab.findById(resolvedCabId);
            if (!cab) {
                return res.status(404).json({
                    success: false,
                    message: "Cab not found"
                });
            }
        }

        // Verify driver exists if assigned & fallback to available driver when needed
        if (assignedDriver) {
            const driver = await Staff.findOne({ _id: assignedDriver, designation: "Driver" });
            if (!driver) {
                return res.status(404).json({
                    success: false,
                    message: "Driver not found"
                });
            }

            if (driver.status !== "Available") {
                const alternativeDriver = await findAvailableDriver({
                    preferredCabId: resolvedCabId,
                    excludeDriverIds: [assignedDriver]
                });

                if (!alternativeDriver) {
                    return res.status(409).json({
                        success: false,
                        message: "Requested driver is unavailable and no alternative drivers are free right now"
                    });
                }

                resolvedDriverId = alternativeDriver._id;
            } else {
                resolvedDriverId = driver._id;
            }
        } else {
            // Auto-assign driver for the selected cab (or any available driver if no cab)
            const autoDriver = await findAvailableDriver({ preferredCabId: resolvedCabId });

            if (autoDriver) {
                resolvedDriverId = autoDriver._id;
            } else if (resolvedCabId) {
                // If cab is assigned but no driver found, still create booking but warn
                console.warn(`No available driver found for cab ${resolvedCabId}`);
            }
        }

        // Set default drop location to hotel if not provided
        const finalDropLocation = dropLocation || {
            address: "Hotel",
            city: "",
            state: "",
            zipCode: ""
        };

        const resolvedEstimatedDistance = PICKUP_DISTANCE_MAP[pickUpLocation] !== undefined
            ? PICKUP_DISTANCE_MAP[pickUpLocation]
            : (estimatedDistance ?? null);

        // Determine status based on assignment
        let bookingStatus = "Pending";
        if (resolvedCabId && resolvedDriverId) {
            bookingStatus = "Assigned";
        } else if (resolvedCabId || resolvedDriverId) {
            bookingStatus = "Confirmed";
        }

        const newCabBooking = await CabBooking.create({
            booking: bookingId,
            pickUpLocation,
            dropLocation: finalDropLocation,
            assignedCab: resolvedCabId || null,
            assignedDriver: resolvedDriverId || null,
            bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
            pickUpTime: new Date(pickUpTime),
            estimatedDistance: resolvedEstimatedDistance,
            estimatedFare: estimatedFare || null,
            specialInstructions: specialInstructions || "",
            notes: notes || "",
            preferredSeatingCapacity: preferredSeatingCapacity || null,
            status: bookingStatus
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

        if (resolvedDriverId) {
            await emitUserNotification({
                userId: resolvedDriverId,
                event: 'notify',
                data: {
                    type: 'cab_booking_assigned',
                    bookingId: newCabBooking._id,
                    message: `You have been assigned to a new cab booking for ${pickUpLocation.address || 'a location'}`,
                    pickUpTime: newCabBooking.pickUpTime,
                    pickUpLocation: newCabBooking.pickUpLocation
                }
            });
        }

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
            bookingId,
            assignedCab,
            assignedDriver,
            dateFrom,
            dateTo,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (status) filter.status = status;
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
        
        const skip = (page - 1) * limit;

        const totalCount = await CabBooking.countDocuments(filter);

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
            .sort({ bookingDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            count: totalCount,
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

        const oldDriverId = cabBooking.assignedDriver;

        // Update fields if provided
        if (pickUpLocation !== undefined) {
            // Handle pickUpLocation as string (enum) or object
            if (typeof pickUpLocation === 'string') {
                cabBooking.pickUpLocation = pickUpLocation;
            } else if (pickUpLocation && typeof pickUpLocation === 'object') {
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
        }

        const mappedDistance = PICKUP_DISTANCE_MAP[cabBooking.pickUpLocation];
        if (mappedDistance !== undefined) {
            cabBooking.estimatedDistance = mappedDistance;
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
            if (assignedDriver === null) {
                cabBooking.assignedDriver = null;
            } else if (assignedDriver) {
                const driver = await Staff.findOne({ _id: assignedDriver, designation: "Driver" });
                if (!driver) {
                    return res.status(404).json({
                        success: false,
                        message: "Driver not found"
                    });
                }

                if (driver.status !== "Available") {
                    const alternativeDriver = await findAvailableDriver({
                        preferredCabId: assignedCab || cabBooking.assignedCab,
                        excludeDriverIds: [assignedDriver]
                    });

                    if (!alternativeDriver) {
                        return res.status(409).json({
                            success: false,
                            message: "Requested driver is unavailable and no alternative drivers are free right now"
                        });
                    }

                    cabBooking.assignedDriver = alternativeDriver._id;
                } else {
                    cabBooking.assignedDriver = assignedDriver;
                }
            } else {
                const autoDriver = await findAvailableDriver({
                    preferredCabId: assignedCab || cabBooking.assignedCab
                });
                cabBooking.assignedDriver = autoDriver ? autoDriver._id : null;
            }
        }

        if (bookingDate) cabBooking.bookingDate = new Date(bookingDate);
        if (pickUpTime) cabBooking.pickUpTime = new Date(pickUpTime);
        if (estimatedDistance !== undefined) cabBooking.estimatedDistance = estimatedDistance;
        
        // Handle estimatedFare update and adjust booking total
        if (estimatedFare !== undefined) {
            const oldFare = cabBooking.estimatedFare || 0;
            const newFare = estimatedFare || 0;
            const fareDifference = newFare - oldFare;
            
            cabBooking.estimatedFare = newFare;
            
            // Update booking total amount if fare changed
            if (fareDifference !== 0) {
                const booking = await Booking.findById(cabBooking.booking);
                if (booking) {
                    const currentTotal = booking.payment?.totalAmount || 0;
                    const newTotal = Math.max(0, currentTotal + fareDifference); // Ensure total doesn't go negative
                    booking.payment.totalAmount = newTotal;
                    await booking.save();
                }
            }
        }
        
        if (status) cabBooking.status = status;
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

        if (cabBooking.assignedDriver && String(cabBooking.assignedDriver) !== String(oldDriverId)) {
             await emitUserNotification({
                userId: cabBooking.assignedDriver,
                event: 'notify',
                data: {
                    type: 'cab_booking_assigned',
                    bookingId: cabBooking._id,
                    message: `You have been assigned to a new cab booking for ${cabBooking.pickUpLocation.address || 'a location'}`,
                    pickUpTime: cabBooking.pickUpTime,
                    pickUpLocation: cabBooking.pickUpLocation
                }
            });
        }

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
        const cabBooking = await CabBooking.findById(req.params.id);

        if (!cabBooking) {
            return res.status(404).json({
                success: false,
                message: "Cab booking not found"
            });
        }

        // Get the associated booking to update total amount
        const booking = await Booking.findById(cabBooking.booking);
        
        if (booking && cabBooking.estimatedFare) {
            // Subtract cab fare from booking total amount
            const currentTotal = booking.payment?.totalAmount || 0;
            const cabFare = cabBooking.estimatedFare || 0;
            const newTotal = Math.max(0, currentTotal - cabFare); 
            
            booking.payment.totalAmount = newTotal;
            await booking.save();
        }

        // Delete the cab booking
        await CabBooking.findByIdAndDelete(req.params.id);

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

// Assign drivers to unassigned bookings
exports.assignDriversToUnassignedBookings = async (req, res) => {
    try {
        const result = await assignDriversToUnassignedBookings();
        
        res.status(200).json({
            success: true,
            message: `Driver assignment completed. ${result.assigned} out of ${result.total} bookings assigned.`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Advance Cab Booking Status (for drivers)
exports.advanceCabBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id; // Get driver ID from authenticated user

        const cabBooking = await CabBooking.findById(id)
            .populate({
                path: "booking",
                select: "guest reservation roomNumber status",
                populate: {
                    path: "room",
                    select: "roomNumber roomType"
                }
            })
            .populate({
                path: "assignedDriver",
                select: "name email mobileno"
            });

        if (!cabBooking) {
            return res.status(404).json({ 
                status: 404, 
                success: false,
                message: 'Cab booking not found' 
            });
        }

        // Verify that the authenticated user is the assigned driver
        if (cabBooking.assignedDriver && cabBooking.assignedDriver._id.toString() !== userId.toString()) {
            return res.status(403).json({ 
                status: 403, 
                success: false,
                message: 'You are not authorized to update this booking' 
            });
        }

        // Define status progression steps
        const steps = {
            'Pending': 'InProgress',
            'Confirmed': 'InProgress',
            'Assigned': 'InProgress',
            'InProgress': 'Completed',
            'Completed': 'Completed',
            'Cancelled': 'Cancelled' // Cannot advance from cancelled
        };

        const current = cabBooking.status;
        const next = steps[current];

        if (!next) {
            return res.status(400).json({ 
                status: 400, 
                success: false,
                message: `Cannot advance status from ${current}` 
            });
        }

        if (current === 'Cancelled') {
            return res.status(400).json({ 
                status: 400, 
                success: false,
                message: 'Cannot advance status for cancelled bookings' 
            });
        }

        if (current === 'Completed') {
            return res.status(400).json({ 
                status: 400, 
                success: false,
                message: 'Booking is already completed' 
            });
        }

        // Update status
        cabBooking.status = next;
        await cabBooking.save();

        // Populate the updated booking
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

        // Send notification when completed
        try {
            if (next === 'Completed') {
                const { emitRoleNotification } = require('../socketManager/socketManager');
                const roomNum = cabBooking?.booking?.roomNumber || cabBooking?.booking?.room?.roomNumber || '';
                const guestName = cabBooking?.booking?.guest?.fullName || 'Guest';
                
                await emitRoleNotification({
                    designations: ['admin', 'receptionist'],
                    event: 'notify',
                    data: {
                        type: 'cab_booking_completed',
                        cabBookingId: cabBooking._id,
                        bookingId: cabBooking.booking?._id,
                        roomId: cabBooking.booking?.room?._id,
                        message: roomNum 
                            ? `Cab booking completed for Room ${roomNum} (${guestName})` 
                            : `Cab booking completed for ${guestName}`
                    }
                });
            }
        } catch (notificationError) {
            // Log but don't fail the request if notification fails
            console.error('Notification error:', notificationError);
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: `Status updated: ${current} → ${next}`,
            data: populatedBooking
        });
    } catch (error) {
        return res.status(500).json({ 
            status: 500, 
            success: false,
            message: error.message 
        });
    }
};


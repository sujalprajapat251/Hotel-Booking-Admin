const Booking = require('../models/bookingModel');
const Room = require('../models/createRoomModel');

const ACTIVE_BOOKING_STATUSES = ['Pending', 'Confirmed', 'CheckedIn'];
// Stripe Integration
let stripe = null;
try {
    const Stripe = require('stripe');
    stripe = Stripe(process.env.STRIPE_SECRET);
} catch {}

const formatBooking = (doc) => ({
    id: doc._id,
    room: doc.room,
    roomNumber: doc.roomNumber,
    status: doc.status,
    guest: doc.guest,
    reservation: doc.reservation,
    payment: doc.payment,
    notes: doc.notes,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
});

const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeGuestPayload = (payload = {}) => ({
    fullName: payload.fullName?.trim(),
    email: payload.email?.trim(),
    countrycode: payload.countrycode?.trim(),
    phone: payload.phone?.trim(),
    idNumber: payload.idNumber?.trim(),
    address: payload.address?.trim()
});

const normalizeReservationPayload = (payload = {}) => ({
    checkInDate: parseDate(payload.checkInDate),
    checkOutDate: parseDate(payload.checkOutDate),
    occupancy: {
        adults: payload.occupancy?.adults !== undefined ? Number(payload.occupancy.adults) : (payload.adults !== undefined ? Number(payload.adults) : 1),
        children: payload.occupancy?.children !== undefined ? Number(payload.occupancy.children) : (payload.children !== undefined ? Number(payload.children) : 0)
    },
    specialRequests: payload.specialRequests
});

const normalizePaymentPayload = (payload = {}) => ({
    status: payload.paymentStatus || (payload.payment?.status) || (payload.status && ['Pending', 'Paid', 'Partial', 'Refunded'].includes(payload.status) ? payload.status : undefined) || 'Pending',
    totalAmount: payload.totalAmount !== undefined ? Number(payload.totalAmount) : undefined,
    currency: payload.currency || 'USD',
    method: payload.method || payload.paymentMethod || 'Cash',
    transactions: payload.transactions,
    ...(payload.paymentIntentId ? { paymentIntentId: payload.paymentIntentId } : {})
});

const ensureRoomAvailability = async ({ roomId, checkInDate, checkOutDate, excludeBookingId }) => {
    console.log(roomId, "roomId");
    console.log(checkInDate, "checkInDate");
    console.log(checkOutDate, "checkOutDate");
    console.log(excludeBookingId, "excludeBookingId");

    if (!checkInDate || !checkOutDate) {
        return null;
    }

    return Booking.findOne({
        room: roomId,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
        'reservation.checkInDate': { $lt: checkOutDate },
        'reservation.checkOutDate': { $gt: checkInDate }
    });
};

const refreshRoomStatus = async (roomId) => {
    if (!roomId) return;

    const now = new Date();
    // Find the most relevant ongoing booking
    const ongoingBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        'reservation.checkInDate': { $lte: now },
        'reservation.checkOutDate': { $gt: now }
    }).sort({ 'reservation.checkInDate': 1 });

    let nextStatus = 'Available';
    if (ongoingBooking) {
        if (ongoingBooking.status === 'CheckedIn') {
            nextStatus = 'Occupied';
        } else if (['Pending', 'Confirmed'].includes(ongoingBooking.status)) {
            nextStatus = 'Reserved';
        }
    }

    // If not in any ongoing booking, check if there is a future booking
    if (!ongoingBooking) {
        const futureBooking = await Booking.findOne({
            room: roomId,
            status: { $in: ACTIVE_BOOKING_STATUSES },
            'reservation.checkInDate': { $gt: now }
        }).sort({ 'reservation.checkInDate': 1 });
        // Optionally, you could set a different status for 'Booked in future'
        // For now, we will leave as 'Available'
    }

    await Room.findByIdAndUpdate(roomId, { status: nextStatus });
};


// Create Stripe PaymentIntent for booking
const createBookingPaymentIntent = async (req, res) => {
    try {
    console.log(process.env.STRIPE_SECRET, "STRIPE_SECRET");

        const { totalAmount, currency = 'usd' } = req.body;
        if (!stripe) return res.status(500).json({ success: false, message: 'Stripe SDK not initialized on server' });
        if (!totalAmount) return res.status(400).json({ success: false, message: 'totalAmount is required' });

        const amountMinor = Math.round(Number(totalAmount) * 100);
        const intent = await stripe.paymentIntents.create({
            amount: amountMinor,
            currency,
            payment_method_types: ['card']
        });
        return res.status(200).json({
            success: true,
            clientSecret: intent.client_secret,
            paymentIntentId: intent.id,
            amount: totalAmount
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createBooking = async (req, res) => {
    try {
        const roomId = req.body.roomId || req.body.room;
        const guestPayload = normalizeGuestPayload(req.body.guest || req.body);
        const reservationPayload = normalizeReservationPayload(req.body.reservation || req.body);
        const paymentPayload = normalizePaymentPayload(req.body.payment || req.body);
        const paymentIntentId = req.body.payment?.paymentIntentId || null;
        const paymentMethod = (req.body.payment?.method || req.body.paymentMethod || '').toLowerCase();
        if (
            (paymentMethod === 'card' || paymentMethod === 'bank transfer' || paymentMethod === 'bank_transfer') 
            && paymentIntentId
        ) {
            paymentPayload.paymentIntentId = paymentIntentId;
        }
        const status = req.body.status || 'Pending';
        const notes = req.body.notes || req.body.additionalNotes;

        console.log(paymentIntentId, "paymentIntentId");

        

        if (!roomId) {
            return res.status(400).json({ success: false, message: 'roomId is required' });
        }
        if (!guestPayload.fullName) {
            return res.status(400).json({ success: false, message: 'Guest full name is required' });
        }
        if (!guestPayload.countrycode) {
            return res.status(400).json({ success: false, message: 'Guest countrycode number is required' });
        }
        if (!guestPayload.phone) {
            return res.status(400).json({ success: false, message: 'Guest phone number is required' });
        }
        if (!reservationPayload.checkInDate || !reservationPayload.checkOutDate) {
            return res.status(400).json({ success: false, message: 'Check-in and check-out dates are required' });
        }
        if (reservationPayload.checkOutDate <= reservationPayload.checkInDate) {
            return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
        }
        if (paymentPayload.totalAmount === undefined || Number.isNaN(paymentPayload.totalAmount)) {
            return res.status(400).json({ success: false, message: 'Total amount is required' });
        }
        // Only require paymentIntentId and verify with Stripe if method is card or bank transfer
        if (paymentMethod === 'card' || paymentMethod === 'bank transfer' || paymentMethod === 'bank_transfer') {
            if (!paymentIntentId) {
                return res.status(400).json({ success: false, message: 'paymentIntentId is required' });
            }
            if (!stripe) {
                return res.status(500).json({ success: false, message: 'Stripe SDK not initialized on server' });
            }
            // Verify payment with Stripe
            const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
            // Allow booking if paymentIntent is succeeded OR (for test/dev) just created and requires a payment method
            if (!pi || (pi.status !== 'succeeded' && pi.status !== 'requires_payment_method')) {
                return res.status(402).json({ success: false, message: 'Stripe payment not completed. Booking not created.' });
            }
        }

        const room = await Room.findById(roomId).select('roomNumber status');
        console.log(room, "room");

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const overlappingBooking = await ensureRoomAvailability({
            roomId,
            checkInDate: reservationPayload.checkInDate,
            checkOutDate: reservationPayload.checkOutDate
        });

        console.log(overlappingBooking, "overlappingBooking");


        if (overlappingBooking) {
            return res.status(409).json({
                success: false,
                message: 'Room already booked for the selected dates',
                conflictBookingId: overlappingBooking._id
            });
        }


        const booking = await Booking.create({
            room: roomId,
            roomNumber: room.roomNumber,
            status,
            guest: guestPayload,
            reservation: {
                ...reservationPayload,
            },
            payment: paymentPayload,
            notes,
            createdBy: req.user?._id
        });

        await refreshRoomStatus(roomId);

        const populated = await booking.populate([
            { path: 'room', select: 'roomNumber roomType status capacity cleanStatus' },
            { path: 'createdBy', select: 'fullName email role' }
        ]);

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: formatBooking(populated)
        });
    } catch (error) {
        console.error('createBooking error:', error);
        res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
    }
};

// const getBookings = async (req, res) => {
//     try {
//         const {
//             roomId,
//             status,
//             paymentStatus,
//             checkInFrom,
//             checkInTo,
//             search
//         } = req.query;

//         const filter = {};

//         if (roomId) filter.room = roomId;
//         if (status) filter.status = status;
//         if (paymentStatus) filter['payment.status'] = paymentStatus;

//         if (checkInFrom || checkInTo) {
//             filter['reservation.checkInDate'] = {};
//             if (checkInFrom) filter['reservation.checkInDate'].$gte = parseDate(checkInFrom);
//             if (checkInTo) filter['reservation.checkInDate'].$lte = parseDate(checkInTo);
//         }

//         if (search) {
//             const regex = new RegExp(search.trim(), 'i');
//             filter.$or = [
//                 { 'guest.fullName': regex },
//                 { 'guest.email': regex },
//                 { 'guest.phone': regex },
//                 { roomNumber: regex }
//             ];
//         }

//         // const bookings = await Booking.find(filter)
//         //     .populate('room', 'roomNumber roomType status floor price')
//         //     .populate('createdBy', 'fullName email role')
//         //     .sort({ 'reservation.checkInDate': -1 });
//         const bookings = await Booking.find(filter)
//             .populate({
//                 path: 'room',
//                 select: 'roomNumber roomType status floor price',
//                 populate: { path: 'roomType' }
//             })
//             .populate('createdBy', 'fullName email role')
//             .sort({ 'reservation.checkInDate': -1 });

//         res.json({
//             success: true,
//             count: bookings.length,
//             data: bookings.map(formatBooking)
//         });
//     } catch (error) {
//         console.error('getBookings error:', error);
//         res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
//     }
// };


const getBookings = async (req, res) => {
    try {
        const {
            roomId,
            status,
            paymentStatus,
            checkInFrom,
            checkInTo,
            search,
            page = 1,      // Add pagination params
            limit = 10     // Add pagination params
        } = req.query;

        const filter = {};

        if (roomId) filter.room = roomId;
        if (status) filter.status = status;
        if (paymentStatus) filter['payment.status'] = paymentStatus;

        if (checkInFrom || checkInTo) {
            filter['reservation.checkInDate'] = {};
            if (checkInFrom) filter['reservation.checkInDate'].$gte = parseDate(checkInFrom);
            if (checkInTo) filter['reservation.checkInDate'].$lte = parseDate(checkInTo);
        }

        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { 'guest.fullName': regex },
                { 'guest.email': regex },
                { 'guest.phone': regex },
                { 'guest.countrycode': regex },
                { roomNumber: regex }
            ];
        }

        // Calculate pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const totalCount = await Booking.countDocuments(filter);

        // Fetch paginated bookings
        const bookings = await Booking.find(filter)
            .populate({
                path: 'room',
                select: 'roomNumber roomType status floor price cleanStatus',
                populate: { path: 'roomType' }
            })
            .populate('createdBy', 'fullName email role')
            .sort({ createdAt: -1 }) // Sort by latest first
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            data: bookings.map(formatBooking),
            totalCount,
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            count: bookings.length
        });
    } catch (error) {
        console.error('getBookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate('room', 'roomNumber roomType status capacity price cleanStatus')
            .populate('createdBy', 'fullName email role');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, data: formatBooking(booking) });
    } catch (error) {
        console.error('getBookingById error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
};

const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const originalRoomId = booking.room?.toString();
        const requestedRoomId = (req.body.roomId || req.body.room || originalRoomId)?.toString();
        let roomChanged = requestedRoomId !== originalRoomId;

        if (roomChanged) {
            const roomExists = await Room.findById(requestedRoomId).select('roomNumber');
            if (!roomExists) {
                return res.status(404).json({ success: false, message: 'New room not found' });
            }
            booking.room = requestedRoomId;
            booking.roomNumber = roomExists.roomNumber;
        }

        const guestPayload = normalizeGuestPayload(req.body.guest || req.body);
        if (guestPayload.fullName) booking.guest.fullName = guestPayload.fullName;
        if (guestPayload.email !== undefined) booking.guest.email = guestPayload.email;
        if (guestPayload.phone) booking.guest.phone = guestPayload.phone;
        if (guestPayload.countrycode) booking.guest.countrycode = guestPayload.countrycode;
        if (guestPayload.idNumber !== undefined) booking.guest.idNumber = guestPayload.idNumber;
        if (guestPayload.address !== undefined) booking.guest.address = guestPayload.address;

        const reservationPayload = normalizeReservationPayload(req.body.reservation || req.body);
        const shouldValidateDates =
            reservationPayload.checkInDate ||
            reservationPayload.checkOutDate ||
            roomChanged;

        if (reservationPayload.checkInDate) booking.reservation.checkInDate = reservationPayload.checkInDate;
        if (reservationPayload.checkOutDate) booking.reservation.checkOutDate = reservationPayload.checkOutDate;
        if (reservationPayload.specialRequests !== undefined) booking.reservation.specialRequests = reservationPayload.specialRequests;
        if (reservationPayload.occupancy) {
            if (reservationPayload.occupancy.adults) booking.reservation.occupancy.adults = reservationPayload.occupancy.adults;
            if (reservationPayload.occupancy.children !== undefined) booking.reservation.occupancy.children = reservationPayload.occupancy.children;
        }

        if (shouldValidateDates) {
            const { checkInDate, checkOutDate } = booking.reservation;
            if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-out date must be after check-in date'
                });
            }

            const overlappingBooking = await ensureRoomAvailability({
                roomId: booking.room,
                checkInDate,
                checkOutDate,
                excludeBookingId: booking._id
            });

            if (overlappingBooking) {
                return res.status(409).json({
                    success: false,
                    message: 'Room already booked for the selected dates',
                    conflictBookingId: overlappingBooking._id
                });
            }
        }

        // Only process payment updates if payment data is explicitly provided
        if (req.body.payment || req.body.paymentStatus || req.body.totalAmount !== undefined || req.body.paymentMethod || req.body.currency) {
            const paymentPayload = normalizePaymentPayload(req.body.payment || req.body);
            if (paymentPayload.totalAmount !== undefined && !Number.isNaN(paymentPayload.totalAmount)) {
                booking.payment.totalAmount = paymentPayload.totalAmount;
            }
            // Only update payment status if it's explicitly provided and valid
            if (paymentPayload.status && ['Pending', 'Paid', 'Partial', 'Refunded'].includes(paymentPayload.status)) {
                booking.payment.status = paymentPayload.status;
            }
            if (paymentPayload.currency) booking.payment.currency = paymentPayload.currency;
            if (paymentPayload.method) booking.payment.method = paymentPayload.method;
            if (Array.isArray(paymentPayload.transactions)) booking.payment.transactions = paymentPayload.transactions;
        }

        // Track if status is changing to CheckedOut (before updating booking.status)
        const originalStatus = booking.status;
        const newStatus = req.body.status;
        const isChangingToCheckedOut = newStatus === 'CheckedOut' && originalStatus !== 'CheckedOut';

        if (req.body.status) {
            booking.status = req.body.status;
        }


        if (req.body.notes !== undefined || req.body.additionalNotes !== undefined) {
            booking.notes = req.body.notes ?? req.body.additionalNotes;
        }

        await booking.save();

        console.log("booking0", booking);

        // Update room cleanStatus to "Dirty" when booking status changes to CheckedOut
        // Note: booking.room is already updated if roomChanged is true, so this will update the correct room
        if (isChangingToCheckedOut) {
            await Room.findByIdAndUpdate(booking.room, { cleanStatus: 'Dirty' });
        }

        await refreshRoomStatus(booking.room);
        if (roomChanged && originalRoomId) {
            await refreshRoomStatus(originalRoomId);
        }

        const populated = await booking.populate([
            { path: 'room', select: 'roomNumber roomType status capacity price cleanStatus' },
            { path: 'createdBy', select: 'fullName email role' }
        ]);

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: formatBooking(populated)
        });
    } catch (error) {
        console.error('updateBooking error:', error);
        res.status(500).json({ success: false, message: 'Failed to update booking', error: error.message });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        await refreshRoomStatus(booking.room);

        res.json({
            success: true,
            message: 'Booking deleted successfully',
            data: formatBooking(booking)
        });
    } catch (error) {
        console.error('deleteBooking error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete booking' });
    }
};

const bookRoomByType = async (req, res) => {
    try {
        const { roomType } = req.body;
        const guestPayload = normalizeGuestPayload(req.body.guest || req.body);
        const reservationPayload = normalizeReservationPayload(req.body.reservation || req.body);
        const paymentPayload = normalizePaymentPayload(req.body.payment || req.body);
        const status = req.body.status || 'Pending';
        const notes = req.body.notes || req.body.additionalNotes;
        const paymentIntentId = req.body.paymentIntentId;

        // Validations
        if (!roomType) {
            return res.status(400).json({ success: false, message: 'roomType is required' });
        }
        if (!guestPayload.fullName) {
            return res.status(400).json({ success: false, message: 'Guest full name is required' });
        }
        if (!guestPayload.phone) {
            return res.status(400).json({ success: false, message: 'Guest phone number is required' });
        }
        if (!reservationPayload.checkInDate || !reservationPayload.checkOutDate) {
            return res.status(400).json({ success: false, message: 'Check-in and check-out dates are required' });
        }
        if (reservationPayload.checkOutDate <= reservationPayload.checkInDate) {
            return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
        }
        if (paymentPayload.totalAmount === undefined || Number.isNaN(paymentPayload.totalAmount)) {
            return res.status(400).json({ success: false, message: 'Total amount is required' });
        }
        if (!paymentIntentId) {
            return res.status(400).json({ success: false, message: 'paymentIntentId is required' });
        }
        if (!stripe) {
            return res.status(500).json({ success: false, message: 'Stripe SDK not initialized on server' });
        }
        // Verify payment with Stripe
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (!pi || pi.status !== 'succeeded') {
            return res.status(402).json({ success: false, message: 'Stripe payment not completed. Booking not created.' });
        }

        // Resolve room type to its ObjectId (if user gave readable string)
        let typeId = roomType;
        if (!/^[0-9a-fA-F]{24}$/.test(roomType)) {
            // Not ObjectId, try to resolve name
            const rtDoc = await require('../models/roomtypeModel').findOne({ roomType: roomType.trim() });
            if (!rtDoc) {
                return res.status(404).json({ success: false, message: 'Room type not found' });
            }
            typeId = rtDoc._id;
        }

        // Find available rooms of requested roomType not booked for the overlapping period
        const ACTIVE_BOOKING_STATUSES = ['Pending', 'Confirmed', 'CheckedIn'];
        // 1. Find all rooms of that type (and not in maintenance)
        const rooms = await Room.find({
            roomType: typeId,
            status: { $nin: ['Maintenance'] },
        }).select('_id roomNumber');
        if (!rooms.length) {
            return res.status(404).json({ success: false, message: 'No rooms of the requested type found' });
        }
        const roomIds = rooms.map(r => r._id);
        // 2. Find which rooms are already booked for overlap
        const overlappingBookings = await Booking.find({
            room: { $in: roomIds },
            status: { $in: ACTIVE_BOOKING_STATUSES },
            'reservation.checkInDate': { $lt: reservationPayload.checkOutDate },
            'reservation.checkOutDate': { $gt: reservationPayload.checkInDate },
        }).select('room').lean();
        const bookedRoomIds = new Set(overlappingBookings.map(b => String(b.room)));
        // 3. Find a room not booked for overlap
        const availableRoom = rooms.find(r => !bookedRoomIds.has(String(r._id)));
        if (!availableRoom) {
            return res.status(409).json({ success: false, message: 'No available room of the requested type for the selected dates' });
        }
        // 4. Create booking
        const booking = await Booking.create({
            room: availableRoom._id,
            roomNumber: availableRoom.roomNumber,
            status,
            guest: guestPayload,
            reservation: { ...reservationPayload },
            payment: paymentPayload,
            notes,
            createdBy: req.user?._id,
            paymentIntentId
        });
        await refreshRoomStatus(availableRoom._id);
        const populated = await booking.populate([
            { path: 'room', select: 'roomNumber roomType status capacity cleanStatus' },
            { path: 'createdBy', select: 'fullName email role' }
        ]);
        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: formatBooking(populated)
        });
    } catch (error) {
        console.error('bookRoomByType error:', error);
        res.status(500).json({ success: false, message: 'Failed to book room', error: error.message });
    }
};

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    bookRoomByType,
    createBookingPaymentIntent, // <- export new intent fn
};
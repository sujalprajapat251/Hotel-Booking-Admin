const Booking = require('../models/bookingModel');
const Room = require('../models/createRoomModel');

const ACTIVE_BOOKING_STATUSES = ['Pending', 'Confirmed', 'CheckedIn'];

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

const bookingStatusToRoomStatus = (bookingStatus) => {
    switch (bookingStatus) {
        case 'CheckedIn':
            return 'Occupied';
        case 'CheckedOut':
        case 'Cancelled':
        case 'NoShow':
            return 'Available';
        default:
            return 'Reserved';
    }
};

const generateBookingReference = () => {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${Date.now().toString(36).toUpperCase()}${randomPart}`;
};

const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeGuestPayload = (payload = {}) => ({
    fullName: payload.fullName?.trim(),
    email: payload.email?.trim(),
    phone: payload.phone?.trim(),
    idNumber: payload.idNumber?.trim(),
    nationality: payload.nationality?.trim(),
    address: payload.address?.trim()
});

const normalizeReservationPayload = (payload = {}) => ({
    checkInDate: parseDate(payload.checkInDate),
    checkOutDate: parseDate(payload.checkOutDate),
    bookingSource: payload.bookingSource || 'Direct',
    bookingReference: payload.bookingReference,
    occupancy: {
        adults: payload.occupancy?.adults !== undefined ? Number(payload.occupancy.adults) : (payload.adults !== undefined ? Number(payload.adults) : 1),
        children: payload.occupancy?.children !== undefined ? Number(payload.occupancy.children) : (payload.children !== undefined ? Number(payload.children) : 0)
    },
    specialRequests: payload.specialRequests
});

const normalizePaymentPayload = (payload = {}) => ({
    status: payload.status || payload.paymentStatus || 'Pending',
    totalAmount: payload.totalAmount !== undefined ? Number(payload.totalAmount) : undefined,
    currency: payload.currency || 'USD',
    method: payload.method || payload.paymentMethod || 'Cash',
    transactions: payload.transactions
});

const ensureRoomAvailability = async ({ roomId, checkInDate, checkOutDate, excludeBookingId }) => {
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

    const activeBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ACTIVE_BOOKING_STATUSES }
    }).sort({ 'reservation.checkInDate': 1 });

    const nextStatus = activeBooking ? bookingStatusToRoomStatus(activeBooking.status) : 'Available';
    await Room.findByIdAndUpdate(roomId, { status: nextStatus });
};

const createBooking = async (req, res) => {
    try {
        const roomId = req.body.roomId || req.body.room;
        const guestPayload = normalizeGuestPayload(req.body.guest || req.body);
        const reservationPayload = normalizeReservationPayload(req.body.reservation || req.body);
        const paymentPayload = normalizePaymentPayload(req.body.payment || req.body);
        const status = req.body.status || 'Pending';
        const notes = req.body.notes || req.body.additionalNotes;

        if (!roomId) {
            return res.status(400).json({ success: false, message: 'roomId is required' });
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

        const room = await Room.findById(roomId).select('roomNumber status');
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const overlappingBooking = await ensureRoomAvailability({
            roomId,
            checkInDate: reservationPayload.checkInDate,
            checkOutDate: reservationPayload.checkOutDate
        });

        if (overlappingBooking) {
            return res.status(409).json({
                success: false,
                message: 'Room already booked for the selected dates',
                conflictBookingId: overlappingBooking._id
            });
        }

        const bookingReference = (reservationPayload.bookingReference || generateBookingReference()).toUpperCase();

        const booking = await Booking.create({
            room: roomId,
            roomNumber: room.roomNumber,
            status,
            guest: guestPayload,
            reservation: {
                ...reservationPayload,
                bookingReference
            },
            payment: paymentPayload,
            notes,
            createdBy: req.user?._id
        });

        await refreshRoomStatus(roomId);

        const populated = await booking
            .populate('room', 'roomNumber roomType status capacity')
            .populate('createdBy', 'fullName email role');

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: formatBooking(populated)
        });
    } catch (error) {
        console.error('createBooking error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Booking reference already exists' });
        }
        res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
    }
};

const getBookings = async (req, res) => {
    try {
        const {
            roomId,
            status,
            paymentStatus,
            checkInFrom,
            checkInTo,
            search
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
                { 'reservation.bookingReference': regex },
                { roomNumber: regex }
            ];
        }

        const bookings = await Booking.find(filter)
            .populate('room', 'roomNumber roomType status floor price')
            .populate('createdBy', 'fullName email role')
            .sort({ 'reservation.checkInDate': -1 });

        res.json({
            success: true,
            count: bookings.length,
            data: bookings.map(formatBooking)
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
            .populate('room', 'roomNumber roomType status capacity price')
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
        if (guestPayload.idNumber !== undefined) booking.guest.idNumber = guestPayload.idNumber;
        if (guestPayload.nationality !== undefined) booking.guest.nationality = guestPayload.nationality;
        if (guestPayload.address !== undefined) booking.guest.address = guestPayload.address;

        const reservationPayload = normalizeReservationPayload(req.body.reservation || req.body);
        const shouldValidateDates =
            reservationPayload.checkInDate ||
            reservationPayload.checkOutDate ||
            roomChanged;

        if (reservationPayload.checkInDate) booking.reservation.checkInDate = reservationPayload.checkInDate;
        if (reservationPayload.checkOutDate) booking.reservation.checkOutDate = reservationPayload.checkOutDate;
        if (reservationPayload.bookingSource !== undefined) booking.reservation.bookingSource = reservationPayload.bookingSource;
        if (reservationPayload.specialRequests !== undefined) booking.reservation.specialRequests = reservationPayload.specialRequests;
        if (reservationPayload.occupancy) {
            if (reservationPayload.occupancy.adults) booking.reservation.occupancy.adults = reservationPayload.occupancy.adults;
            if (reservationPayload.occupancy.children !== undefined) booking.reservation.occupancy.children = reservationPayload.occupancy.children;
        }
        if (reservationPayload.bookingReference) {
            booking.reservation.bookingReference = reservationPayload.bookingReference.toUpperCase();
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

        const paymentPayload = normalizePaymentPayload(req.body.payment || req.body);
        if (paymentPayload.totalAmount !== undefined && !Number.isNaN(paymentPayload.totalAmount)) {
            booking.payment.totalAmount = paymentPayload.totalAmount;
        }
        if (paymentPayload.status) booking.payment.status = paymentPayload.status;
        if (paymentPayload.currency) booking.payment.currency = paymentPayload.currency;
        if (paymentPayload.method) booking.payment.method = paymentPayload.method;
        if (Array.isArray(paymentPayload.transactions)) booking.payment.transactions = paymentPayload.transactions;

        if (req.body.status) {
            booking.status = req.body.status;
        }

        if (req.body.notes !== undefined || req.body.additionalNotes !== undefined) {
            booking.notes = req.body.notes ?? req.body.additionalNotes;
        }

        await booking.save();

        await refreshRoomStatus(booking.room);
        if (roomChanged && originalRoomId) {
            await refreshRoomStatus(originalRoomId);
        }

        const populated = await booking
            .populate('room', 'roomNumber roomType status capacity price')
            .populate('createdBy', 'fullName email role');

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: formatBooking(populated)
        });
    } catch (error) {
        console.error('updateBooking error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Booking reference already exists' });
        }
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

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking
};

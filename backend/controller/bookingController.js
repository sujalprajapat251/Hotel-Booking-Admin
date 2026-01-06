const Booking = require('../models/bookingModel');
const Room = require('../models/createRoomModel');
const CabBooking = require('../models/cabBookingModel');
const nodemailer = require("nodemailer");
const { emitBookingChanged } = require('../socketManager/socketManager');
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
    checkInTime: doc.checkInTime,
    checkOutTime: doc.checkOutTime,
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
    status: payload.paymentStatus
        || (payload.payment?.status)
        || (payload.status && ['Pending', 'Paid', 'Partial', 'Refunded'].includes(payload.status) ? payload.status : undefined)
        || 'Pending',
    totalAmount: payload.totalAmount !== undefined ? Number(payload.totalAmount) : undefined,
    refundedAmount: payload.refundedAmount !== undefined ? Number(payload.refundedAmount) : undefined,
    currency: payload.currency || 'USD',
    method: payload.method || payload.paymentMethod || 'Cash',
    transactions: payload.transactions,
    ...(payload.paymentIntentId ? { paymentIntentId: payload.paymentIntentId } : {})
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

    const now = new Date();
    // Normalize to start of today for date comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    // Find the most relevant ongoing booking (check-in date <= now and check-out date > now)
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
    } else {
        // Check if there's a booking with check-in date matching today
        const todayCheckInBooking = await Booking.findOne({
            room: roomId,
            status: { $in: ACTIVE_BOOKING_STATUSES },
            'reservation.checkInDate': { $gte: todayStart, $lte: todayEnd },
            'reservation.checkOutDate': { $gt: now }
        }).sort({ 'reservation.checkInDate': 1 });

        if (todayCheckInBooking) {
            // If check-in date is today, mark room as Reserved
            if (todayCheckInBooking.status === 'CheckedIn') {
                nextStatus = 'Occupied';
            } else if (['Pending', 'Confirmed'].includes(todayCheckInBooking.status)) {
                nextStatus = 'Reserved';
            }
        } else {
            // Check if there is a future booking (check-in date > now)
            const futureBooking = await Booking.findOne({
                room: roomId,
                status: { $in: ACTIVE_BOOKING_STATUSES },
                'reservation.checkInDate': { $gt: now }
            }).sort({ 'reservation.checkInDate': 1 });
            
            // Fu   ture bookings don't change status to Reserved, keep as Available
            // Only today's check-in or ongoing bookings change status
        }
    }

    await Room.findByIdAndUpdate(roomId, { status: nextStatus });
};

// Create Stripe PaymentIntent for booking
const createBookingPaymentIntent = async (req, res) => {
    try {

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

        emitBookingChanged({ type: 'create', bookingId: booking._id, roomId });

        console.log("_____",roomId);

        const populated = await booking.populate([
            { path: 'room', select: 'roomNumber roomType status capacity cleanStatus',populate: {path: 'roomType', select: 'roomType' } },
            { path: 'createdBy', select: 'fullName email role' }
        ]);

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const emailHtml = `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #F7DF9C, #E3C78A); padding: 20px; text-align: center; color: #755647;">
          <h2 style="margin: 0; font-size: 24px;">Booking Confirmation</h2>
          <p style="margin: 5px 0 0;">Thank you for choosing our hotel!</p>
      </div>

      <!-- Body -->
      <div style="padding: 25px; background-color: #ffffff;">
          <p style="font-size: 16px;">Dear <b>${guestPayload.fullName}</b>,</p>

          <p style="font-size: 15px; color: #333;">
              We are pleased to confirm your booking. Below are your booking details:
          </p>

          <div style="margin-top: 20px; border: 1px solid #eee; border-radius: 8px; padding: 15px; background: #fafafa;">
              <h3 style="margin: 0 0 10px; font-size: 18px; color: #755647;">Booking Details</h3>
              <table style="width: 100%; font-size: 15px; color: #444; border-collapse: collapse;">
                  <tr>
                      <td style="padding: 8px 0;"><b>Room Number:</b></td>
                      <td style="padding: 8px 0;">${room.roomNumber}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Room Type:</b></td>
                      <td style="padding: 8px 0;">${populated.room.roomType.roomType}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Check-In Date:</b></td>
                      <td style="padding: 8px 0;">${reservationPayload.checkInDate.toLocaleDateString()}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Check-Out Date:</b></td>
                      <td style="padding: 8px 0;">${reservationPayload.checkOutDate.toLocaleDateString()}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Total Amount:</b></td>
                      <td style="padding: 8px 0;">$${paymentPayload.totalAmount}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Payment Method:</b></td>
                      <td style="padding: 8px 0; text-transform: capitalize;">${paymentMethod}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Status:</b></td>
                      <td style="padding: 8px 0;">${status}</td>
                  </tr>
              </table>
          </div>

          <p style="margin-top: 20px; font-size: 15px;">
              If you have any questions or need further support, feel free to reply to this email.
          </p>

          <p style="font-size: 16px; margin-top: 25px; ">Warm Regards,<br/>
              <p style="color:#755647"><b>Hotel Management Team</b></p>
          </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 15px; background: #f2f2f2; font-size: 13px; color: #666;">
          © ${new Date().getFullYear()} Your Hotel Name. All Rights Reserved.
      </div>

  </div>
`;

        await transport.sendMail({
            from: process.env.EMAIL_USER,
            to: guestPayload?.email,
            subject: "Your Booking Confirmation",
            html: emailHtml,
        });

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully..!',
            data: formatBooking(populated)
        });
    } catch (error) {
        console.error('createBooking error:', error);
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
            search,
            page = 1,      
            limit = 10     
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
            .sort({ createdAt: -1 }) 
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

const getUserBookings = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userEmail = req.user.email?.toLowerCase().trim();
        if (!userEmail) {
            return res.status(400).json({ success: false, message: 'User email not found' });
        }

        const {
            status,
            paymentStatus,
            checkInFrom,
            checkInTo,
            search,
            page = 1,      
            limit = 10     
        } = req.query;

        // Filter bookings by user's email (matching guest email)
        const filter = {
            'guest.email': { $regex: new RegExp(`^${userEmail}$`, 'i') }
        };

        // Additional filters
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
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limitNum);

        // Get all booking IDs to fetch cab bookings
        const bookingIds = bookings.map(b => b._id);

        // Fetch cab bookings for these bookings
        const cabBookings = await CabBooking.find({ booking: { $in: bookingIds } })
            .populate({
                path: 'assignedCab',
                select: 'vehicleId modelName registrationNumber seatingCapacity perKmCharge'
            })
            .populate({
                path: 'assignedDriver',
                select: 'name email mobileno'
            })
            .sort({ bookingDate: -1 })
            .lean();

        // Group cab bookings by booking ID
        const cabBookingsByBookingId = {};
        cabBookings.forEach(cabBooking => {
            const bookingId = cabBooking.booking.toString();
            if (!cabBookingsByBookingId[bookingId]) {
                cabBookingsByBookingId[bookingId] = [];
            }
            cabBookingsByBookingId[bookingId].push(cabBooking);
        });

        // Format bookings and attach cab bookings
        const formattedBookings = bookings.map(booking => {
            const formatted = formatBooking(booking);
            const bookingId = booking._id.toString();
            formatted.cabBookings = cabBookingsByBookingId[bookingId] || [];
            return formatted;
        });

        res.json({
            success: true,
            data: formattedBookings,
            totalCount,
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            count: bookings.length
        });
    } catch (error) {
        console.error('getUserBookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user bookings' });
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
            if (!checkInDate || !checkOutDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-in and check-out dates are required'
                });
            }
            
            // Only validate if checkout is not before check-in (normal case)
            if (checkOutDate > checkInDate) {
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
        }

        // Only process payment updates if payment data is explicitly provided
        if (req.body.payment || req.body.paymentStatus || req.body.totalAmount !== undefined || req.body.paymentMethod || req.body.currency || req.body.refundedAmount !== undefined) {
            const paymentPayload = normalizePaymentPayload(req.body.payment || req.body);
            if (paymentPayload.totalAmount !== undefined && !Number.isNaN(paymentPayload.totalAmount)) {
                booking.payment.totalAmount = paymentPayload.totalAmount;
            }
            if (paymentPayload.refundedAmount !== undefined && !Number.isNaN(paymentPayload.refundedAmount)) {
                booking.payment.refundedAmount = paymentPayload.refundedAmount;
            }
            // Only update payment status if it's explicitly provided and valid
            if (paymentPayload.status && ['Pending', 'Paid', 'Partial', 'Refunded'].includes(paymentPayload.status)) {
                booking.payment.status = paymentPayload.status;
            }
            if (paymentPayload.currency) booking.payment.currency = paymentPayload.currency;
            if (paymentPayload.method) booking.payment.method = paymentPayload.method;
            if (Array.isArray(paymentPayload.transactions)) booking.payment.transactions = paymentPayload.transactions;
        }

        // Track if status is changing to CheckedIn or CheckedOut (before updating booking.status)
        const originalStatus = booking.status;
        const newStatus = req.body.status;
        const isChangingToCheckedIn = newStatus === 'CheckedIn' && originalStatus !== 'CheckedIn';
        const isChangingToCheckedOut = newStatus === 'CheckedOut' && originalStatus !== 'CheckedOut';
        // Determine final status after update
        const finalStatus = newStatus || originalStatus;

        // Track check-in time when status changes to CheckedIn
        if (isChangingToCheckedIn && !booking.checkInTime) {
            booking.checkInTime = new Date();
        }

        // Track check-out time when status changes to CheckedOut
        if (isChangingToCheckedOut && !booking.checkOutTime) {
            booking.checkOutTime = new Date();
        }

        // Check for early checkout (checkout before check-in date) - should trigger refund
        const checkInDate = booking.reservation.checkInDate;
        const checkOutDate = booking.reservation.checkOutDate;
        // Compare dates (normalize to date only, ignoring time)
        let isEarlyCheckout = false;
        if (checkInDate && checkOutDate) {
            const checkInDateOnly = new Date(checkInDate);
            checkInDateOnly.setHours(0, 0, 0, 0);
            const checkOutDateOnly = new Date(checkOutDate);
            checkOutDateOnly.setHours(0, 0, 0, 0);
            isEarlyCheckout = checkOutDateOnly < checkInDateOnly;
        }
        
        if (req.body.status) {
            // Check if user is trying to cancel with pending payment
            if (req.body.status === 'Cancelled' && booking.payment?.status === 'Pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel booking with Pending payment. Please complete payment first.'
                });
            }

            booking.status = req.body.status;
            
            // If booking is cancelled, also cancel associated cab bookings
            if (booking.status === 'Cancelled') {
                await CabBooking.updateMany(
                    { booking: booking._id },
                    { $set: { status: 'Cancelled' } }
                );

                // Calculate 70% refund if payment status is Paid (30% cancellation fee)
                if (booking.payment?.status === 'Paid' && booking.payment?.totalAmount) {
                    const refundAmount = booking.payment.totalAmount * 0.7;
                    let stripeRefundId = null;
                    let refundSuccess = false;
                    let refundError = null;

                    // Process Stripe refund if payment was made via Stripe
                    if (booking.payment?.paymentIntentId && stripe) {
                        try {
                            // Convert refund amount to cents (Stripe uses smallest currency unit)
                            const refundAmountInCents = Math.round(refundAmount * 100);
                            
                            // Create refund in Stripe
                            const refund = await stripe.refunds.create({
                                payment_intent: booking.payment.paymentIntentId,
                                amount: refundAmountInCents,
                                reason: 'requested_by_customer',
                                metadata: {
                                    bookingId: booking._id.toString(),
                                    refundType: 'cancellation',
                                    refundAmount: refundAmount
                                }
                            });

                            stripeRefundId = refund.id;
                            refundSuccess = true;
                            console.log(`Stripe refund created: ${stripeRefundId} for booking ${booking._id}`);
                        } catch (stripeError) {
                            console.error('Stripe refund error:', stripeError);
                            refundError = stripeError.message;
                            // Continue with database refund record even if Stripe fails
                        }
                    }
                    
                    booking.payment.status = 'Refunded';
                    booking.payment.refundedAmount = refundAmount;

                     // Initialize transactions array if needed
                     if (!Array.isArray(booking.payment.transactions)) {
                        booking.payment.transactions = [];
                    }

                    booking.payment.transactions.push({
                        amount: refundAmount,
                        method: booking.payment.method || 'Online',
                        status: 'Refunded',
                        paidAt: new Date(),
                        reference: stripeRefundId || `REF-CANCEL-${booking._id}-${Date.now()}`,
                        notes: refundSuccess 
                            ? `Cancellation Refund (70% of ${booking.payment.totalAmount} = $${refundAmount.toFixed(2)}) - Stripe Refund ID: ${stripeRefundId}`
                            : refundError
                                ? `Cancellation Refund (70% of ${booking.payment.totalAmount} = $${refundAmount.toFixed(2)}) - Stripe Error: ${refundError}`
                                : `Cancellation Refund (70% of ${booking.payment.totalAmount} = $${refundAmount.toFixed(2)}) - Manual refund required`
                    });
                }
            }
        }


        if (req.body.notes !== undefined || req.body.additionalNotes !== undefined) {
            booking.notes = req.body.notes ?? req.body.additionalNotes;
        }

        // Handle early checkout refund: if checkout date is before check-in date and status is CheckedOut
        // This handles both: status changing to CheckedOut OR checkout date being changed to before check-in while already CheckedOut

        if (finalStatus === 'CheckedOut' && isEarlyCheckout) {
            // Calculate refund amount: use explicit amount if provided, otherwise full amount for early checkout
            let refundAmount = booking.payment.totalAmount || 0;
            
            // Only process if refund amount is valid
            if (refundAmount > 0) {                
                // Initialize transactions array if needed
                if (!Array.isArray(booking.payment.transactions)) {
                    booking.payment.transactions = [];
                }
                
                // Check if refund transaction already exists to avoid duplicates
                const hasRefundTransaction = booking.payment.transactions.some(
                    t => t.status === 'Refunded' && (
                        (isEarlyCheckout && t.notes && t.notes.includes('Early checkout refund')) ||
                        (explicitRefundAmount && t.reference && t.reference.includes('REF-'))
                    )
                );
                
                if (!hasRefundTransaction) {
                    const refundNote = isEarlyCheckout 
                        ? `Early checkout refund - Checkout date (${new Date(checkOutDate).toLocaleDateString()}) is before check-in date (${new Date(checkInDate).toLocaleDateString()})`
                        : `Refund processed - Amount: ${refundAmount}`;
                    
                    booking.payment.transactions.push({
                        amount: refundAmount,
                        method: booking.payment.method,
                        status: 'Refunded',
                        paidAt: new Date(),
                        reference: `REF-${booking._id}-${Date.now()}`,
                        notes: refundNote
                    });
                }
            }
        }

        await booking.save();

        // Note: booking.room is already updated if roomChanged is true, so this will update the correct room
        if (isChangingToCheckedOut) {
            await Room.findByIdAndUpdate(booking.room, { cleanStatus: 'Dirty' });
        }

        await refreshRoomStatus(booking.room);
        if (roomChanged && originalRoomId) {
            await refreshRoomStatus(originalRoomId);
        }

        emitBookingChanged({ type: 'update', bookingId: booking._id, roomId: booking.room });

        const populated = await booking.populate([
            { 
                path: 'room', 
                select: 'roomNumber roomType status capacity price cleanStatus', 
                populate: { path: 'roomType' }
            },
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

        await CabBooking.deleteMany({ booking: id });

        await refreshRoomStatus(booking.room);

        emitBookingChanged({ type: 'delete', bookingId: id, roomId: booking.room });

        res.json({
            success: true,
            message: 'Booking and associated cab bookings deleted successfully',
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

        // Validations
        if (!roomType) {
            return res.status(400).json({ success: false, message: 'roomType is required' });
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
            if (!pi  || pi.status !== 'succeeded') {
                return res.status(402).json({ success: false, message: 'Stripe payment not completed. Booking not created.' });
            }
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
            createdBy: req.user?._id
        });
        await refreshRoomStatus(availableRoom._id);
        emitBookingChanged({ type: 'create', bookingId: booking._id, roomId: availableRoom._id });
        const populated = await booking.populate([
            { path: 'room', select: 'roomNumber roomType status capacity cleanStatus',populate: {path: 'roomType', select: 'roomType' } },
            { path: 'createdBy', select: 'fullName email role' }
        ]);

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const emailHtml = `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #F7DF9C, #E3C78A); padding: 20px; text-align: center; color: #755647;">
          <h2 style="margin: 0; font-size: 24px;">Booking Confirmation</h2>
          <p style="margin: 5px 0 0;">Thank you for choosing our hotel!</p>
      </div>

      <!-- Body -->
      <div style="padding: 25px; background-color: #ffffff;">
          <p style="font-size: 16px;">Dear <b>${guestPayload.fullName}</b>,</p>

          <p style="font-size: 15px; color: #333;">
              We are pleased to confirm your booking. Below are your booking details:
          </p>

          <div style="margin-top: 20px; border: 1px solid #eee; border-radius: 8px; padding: 15px; background: #fafafa;">
              <h3 style="margin: 0 0 10px; font-size: 18px; color: #755647;">Booking Details</h3>
              <table style="width: 100%; font-size: 15px; color: #444; border-collapse: collapse;">
                  <tr>
                      <td style="padding: 8px 0;"><b>Room Number:</b></td>
                      <td style="padding: 8px 0;">${availableRoom.roomNumber}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Room Type:</b></td>
                      <td style="padding: 8px 0;">${populated.room.roomType.roomType}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Check-In Date:</b></td>
                      <td style="padding: 8px 0;">${reservationPayload.checkInDate.toLocaleDateString()}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Check-Out Date:</b></td>
                      <td style="padding: 8px 0;">${reservationPayload.checkOutDate.toLocaleDateString()}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Total Amount:</b></td>
                      <td style="padding: 8px 0;">$${paymentPayload.totalAmount}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Payment Method:</b></td>
                      <td style="padding: 8px 0; text-transform: capitalize;">${paymentMethod}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0;"><b>Status:</b></td>
                      <td style="padding: 8px 0;">${status}</td>
                  </tr>
              </table>
          </div>

          <p style="margin-top: 20px; font-size: 15px;">
              If you have any questions or need further support, feel free to reply to this email.
          </p>

          <p style="font-size: 16px; margin-top: 25px; ">Warm Regards,<br/>
              <p style="color:#755647"><b>Hotel Management Team</b></p>
          </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 15px; background: #f2f2f2; font-size: 13px; color: #666;">
          © ${new Date().getFullYear()} Your Hotel Name. All Rights Reserved.
      </div>

  </div>
`;

        await transport.sendMail({
            from: process.env.EMAIL_USER,
            to: guestPayload?.email,
            subject: "Your Booking Confirmation",
            html: emailHtml,
        });


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
    getUserBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    bookRoomByType,
    createBookingPaymentIntent,
    refreshRoomStatus
};
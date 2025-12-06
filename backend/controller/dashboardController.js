const BarOrder = require('../models/barOrderModal');
const RestroOrder = require('../models/restaurantOrderModal');
const CafeOrder = require('../models/cafeOrderModal');
const RoomBooking = require("../models/bookingModel");
const Room = require("../models/createRoomModel");
const RoomType = require("../models/roomtypeModel");

// Line chart: booking trend by day
function lineTrend(model, match = {}) {
    return model.aggregate([
        { $match: match },
        {
            $group: {
                _id: { $dayOfMonth: "$createdAt" },
                value: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);
}

// Common revenue aggregation for Bar / Cafe / Restro
function calculateRevenue(model, itemCollection, start, end) {
    return model.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                payment: "Paid"
            }
        },
        { $unwind: "$items" },
        {
            $lookup: {
                from: itemCollection,
                localField: "items.product",
                foreignField: "_id",
                as: "productData"
            }
        },
        { $unwind: "$productData" },
        {
            $group: {
                _id: null,
                total: { $sum: { $multiply: ["$items.qty", "$productData.price"] } }
            }
        }
    ]);
}

// DASHBOARD API (ROOM PIE, NEW BOOKINGS, REVENUE SOURCES)
exports.dashboard = async (req, res) => {
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
            success: false,
            message: "month is required (format: YYYY-MM)"
        });
    }

    let [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59);

    // Previous month
    let prevYear = year;
    let prevMon = mon - 1;
    if (prevMon === 0) {
        prevMon = 12;
        prevYear -= 1;
    }

    const prevStart = new Date(prevYear, prevMon - 1, 1);
    const prevEnd = new Date(prevYear, prevMon, 0, 23, 59, 59);

    // ---------------- 1. NEW BOOKINGS ----------------
    const newBookings = await RoomBooking.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const prevBookings = await RoomBooking.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
    const bookingTrend = await lineTrend(RoomBooking, { createdAt: { $gte: start, $lte: end } });

    // ---------------- 2. ROOM PIE ----------------
    const roomTypes = await RoomType.find();
    const roomPie = [];

    for (let rt of roomTypes) {

        const totalRooms = await Room.countDocuments({ roomType: rt._id });

        const bookedRooms = await RoomBooking.countDocuments({
            "payment.status": "Paid",
            room: { $in: await Room.find({ roomType: rt._id }).select("_id") }
        });

        const availableRooms = totalRooms - bookedRooms;

        roomPie.push({
            roomType: rt.roomType,
            booked: bookedRooms,
            available: availableRooms
        });
    }

    // ---------------- 3. REVENUE SOURCES ----------------
    const barRevenue = await calculateRevenue(BarOrder, "baritems", start, end);
    const cafeRevenue = await calculateRevenue(CafeOrder, "cafeitems", start, end);
    const restroRevenue = await calculateRevenue(RestroOrder, "restaurantitems", start, end);

    const bookingRevenueData = await RoomBooking.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                "payment.status": "Paid"
            }
        },
        {
            $group: { _id: null, total: { $sum: "$payment.totalAmount" } }
        }
    ]);

    const bookingRevenue = bookingRevenueData[0]?.total || 0;

    const revenueSources = {
        bar: barRevenue[0]?.total || 0,
        cafe: cafeRevenue[0]?.total || 0,
        restro: restroRevenue[0]?.total || 0,
        roomBooking: bookingRevenue
    };

    const totalRevenue = Object.values(revenueSources).reduce((a, b) => a + b, 0);

    // ---------------- 4. CHECKOUT TOTAL ----------------
    // FIXED: must use "CheckedOut" not "Checkout"
    const checkoutCount = await RoomBooking.countDocuments({
        status: "CheckedOut",
        createdAt: { $gte: start, $lte: end }
    });

    const prevCheckout = await RoomBooking.countDocuments({
        status: "CheckedOut",
        createdAt: { $gte: prevStart, $lte: prevEnd }
    });

    const checkoutChange =
        prevCheckout > 0
            ? ((checkoutCount - prevCheckout) / prevCheckout) * 100
            : 0;

    // ---------------- 5. ROOMTYPE-WISE CHECKOUT CHANGE ----------------
    const roomTypeCheckout = [];

    for (let rt of roomTypes) {

        // Get room IDs for this roomType
        const roomIds = await Room.find({ roomType: rt._id }).select("_id");

        const currentCount = await RoomBooking.countDocuments({
            status: "CheckedOut",
            room: { $in: roomIds.map(r => r._id) },
            createdAt: { $gte: start, $lte: end }
        });

        const previousCount = await RoomBooking.countDocuments({
            status: "CheckedOut",
            room: { $in: roomIds.map(r => r._id) },
            createdAt: { $gte: prevStart, $lte: prevEnd }
        });

        const percentChange =
            previousCount > 0
                ? ((currentCount - previousCount) / previousCount) * 100
                : 0;

        roomTypeCheckout.push({
            roomType: rt.roomType,
            checkoutCount: currentCount,
            prevCheckout: previousCount,
            checkoutChange: percentChange.toFixed(2)
        });
    }

    // ---------------- RESPONSE ----------------
    return res.json({
        success: true,
        newBookings,
        bookingTrend,
        roomPie,
        availableRooms: roomPie.reduce((sum, r) => sum + r.available, 0),
        totalRevenue,
        revenueSources,
        checkoutCount,
        checkoutChange,
        roomTypeCheckout
    });
};

// Room Availability API (Occupied , Reserved , Available, Not Ready)
exports.roomAvailability = async (req, res) => {
    try {

        const occupied = await Room.countDocuments({ status: "Occupied" });
        const reserved = await Room.countDocuments({ status: "Reserved" });
        const available = await Room.countDocuments({ status: "Available" });
        const notReady = await Room.countDocuments({ 
            $or: [
                { status: "Maintenance" },
                { cleanStatus: "Dirty" }
            ]
        });

        return res.status(200).json({
            success: true,
            data: {
                occupied,
                reserved,
                available,
                notReady
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

// Reservation API (Booked , cancelled)
exports.reservationDaywise = async (req, res) => {
    try {
        let { month: queryMonth } = req.query;
        let year, month;
        let today = new Date();

        if (queryMonth && /^\d{4}-\d{2}$/.test(queryMonth)) {
             [year, month] = queryMonth.split("-").map(Number);
             month = month - 1; // 0-indexed
        } else {
             year = today.getFullYear();
             month = today.getMonth();
        }

        // Start of the month
        const start = new Date(year, month, 1);

        let end;
        if (year === today.getFullYear() && month === today.getMonth()) {
             end = new Date(year, month, today.getDate(), 23, 59, 59);
        } else {
             end = new Date(year, month + 1, 0, 23, 59, 59);
        }

        // Fetch all bookings of this month
        const reservations = await RoomBooking.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $project: {
                    day: { $dayOfMonth: "$createdAt" },
                    status: 1
                }
            },
            {
                $group: {
                    _id: "$day",
                    booked: {
                        $sum: {
                            $cond: [
                                { $in: ["$status", ["Confirmed", "CheckedIn", "CheckedOut"]] },
                                1,
                                0
                            ]
                        }
                    },
                    canceled: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Cancelled"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Convert to formatted array (1 Jan, 2 Jan…)
        const finalData = reservations.map((r) => {
            const d = new Date(year, month, r._id);
            const dayName = d.toLocaleString("en-US", { day: "numeric", month: "short" });

            return {
                day: dayName,
                booked: r.booked,
                canceled: r.canceled
            };
        });

        return res.json({
            success: true,
            month: start.toLocaleString("en-US", { month: "long" }),
            data: finalData
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Order Summary

async function getOrderSummary(model, itemCollection, matchQuery = {}) {
    return model.aggregate([
        { $match: { payment: "Paid", ...matchQuery } },  // no from filter

        { $unwind: "$items" },

        {
            $lookup: {
                from: itemCollection,
                localField: "items.product",
                foreignField: "_id",
                as: "productData"
            }
        },
        { $unwind: "$productData" },

        {
            $addFields: {
                amount: { $multiply: ["$items.qty", "$productData.price"] }
            }
        },

        {
            $group: {
                _id: "$from",   // groups bar/room OR cafe/room OR restaurant/room
                totalOrders: { $addToSet: "$_id" },
                totalAmount: { $sum: "$amount" }
            }
        },

        {
            $project: {
                _id: 0,
                from: "$_id",
                totalOrders: { $size: "$totalOrders" },
                totalAmount: 1
            }
        }
    ]);
}
exports.orderDashboard = async (req, res) => {
    try {
        const { month } = req.query;
        let matchQuery = {};

        if (month && /^\d{4}-\d{2}$/.test(month)) {
            let [year, mon] = month.split("-").map(Number);
            const start = new Date(year, mon - 1, 1);
            const end = new Date(year, mon, 0, 23, 59, 59);
            matchQuery = { createdAt: { $gte: start, $lte: end } };
        }

        const bar = await getOrderSummary(BarOrder, "baritems", matchQuery);
        const cafe = await getOrderSummary(CafeOrder, "cafeitems", matchQuery);
        const restro = await getOrderSummary(RestroOrder, "restaurantitems", matchQuery);

        res.status(200).json({
            success: true,
            data: { bar, cafe, restro }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Booking Trend 
exports.getBookingTrends = async (req, res) => {
    try {
        let { range, month } = req.query;
        let startDate, endDate;
        const now = new Date();

        if (month) {
            const [year, mon] = month.split("-").map(Number);
            startDate = new Date(year, mon - 1, 1);
            endDate = new Date(year, mon, 0, 23, 59, 59);
        } else if (range === "7") {
            endDate = new Date();
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 6); 
            startDate.setHours(0, 0, 0, 0);
        } else if (range === "30") {
            endDate = new Date();
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 29); 
            startDate.setHours(0, 0, 0, 0);
        } else if (range === "year") {
            endDate = new Date();
            startDate = new Date(now.getFullYear(), 0, 1); 
        } else {
            // Default to 7 days if nothing provided
            range = "7";
            endDate = new Date();
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 6); 
            startDate.setHours(0, 0, 0, 0);
        }

        // Aggregation pipeline
        let groupId, sort;
        if (range === "year") {
            groupId = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
            sort = { "_id.year": 1, "_id.month": 1 };
        } else {
            groupId = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
            sort = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
        }

        const bookings = await RoomBooking.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: startDate, $lte: endDate }, 
                    status: { $in: ["Confirmed", "CheckedIn", "CheckedOut"] } 
                } 
            },
            { $group: { _id: groupId, count: { $sum: 1 } } },
            { $sort: sort }
        ]);

        // Helper arrays for names
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Build timeline with names
        let timeline = [];

        if (range === "year") {
            for (let m = 1; m <= 12; m++) {
                const found = bookings.find(b => b._id.month === m);
                timeline.push({ name: monthNames[m - 1], count: found ? found.count : 0 });
            }
        } else {
            let loopDate = new Date(startDate);
            while (loopDate <= endDate) {
                const dayName = dayNames[loopDate.getDay()];
                let nameLabel;

                if (range === "30" || month) {
                    // Show day + date like 'Mon 28'
                    nameLabel = `${dayName} ${loopDate.getDate()}`;
                } else {
                    // Just day name for 7 days
                    nameLabel = dayName;
                }

                const found = bookings.find(b => {
                    const bDate = new Date(b._id.year, b._id.month - 1, b._id.day);
                    return bDate.toDateString() === loopDate.toDateString();
                });

                timeline.push({ name: nameLabel, count: found ? found.count : 0 });
                loopDate.setDate(loopDate.getDate() + 1);
            }
        }

        // Summary
        const totalBookings = timeline.reduce((sum, day) => sum + day.count, 0);
        const dailyAvg = timeline.length ? Math.round(totalBookings / timeline.length) : 0;

        return res.json({ success: true, data: { totalBookings, dailyAverage: dailyAvg, timeline } });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Hotel Occupancy Rate
exports.monthWiseOccupancy = async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();   // total rooms available

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let year = new Date().getFullYear();

        let result = [];

        for (let m = 0; m < 12; m++) {

            let start = new Date(year, m, 1);
            let end = new Date(year, m + 1, 1);

            // count how many bookings in this month
            const bookedRooms = await RoomBooking.countDocuments({
                status: "Booked",
                checkIn: { $lt: end },
                checkOut: { $gte: start }
            });

            let occupancyRate = totalRooms > 0
                ? ((bookedRooms / totalRooms) * 100).toFixed(1)
                : 0;

            result.push({
                month: months[m],
                occupancy: Number(occupancyRate)
            });
        }

        res.json({
            success: true,
            totalRooms,
            data: result
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get total revenue month-wise
exports.monthlyRevenue = async (req, res) => {
    const { year, month } = req.query;

    let targetYear = year;
    let targetMonth = null; // 0-indexed

    if (month) {
        const [y, m] = month.split("-");
        targetYear = y;
        targetMonth = parseInt(m, 10) - 1;
    }

    if (!targetYear || !/^\d{4}$/.test(targetYear)) {
        return res.status(400).json({
            success: false,
            message: "Valid year (YYYY) or month (YYYY-MM) is required"
        });
    }

    const revenueByMonth = [];
    const today = new Date();
    
    // If no specific month requested, default to today's month if year matches, else null
    if (targetMonth === null) {
        if (parseInt(targetYear) === today.getFullYear()) {
            targetMonth = today.getMonth();
        }
    }

    let currentRevenue = 0;
    let prevRevenue = 0;

    for (let m = 0; m < 12; m++) {
        const start = new Date(targetYear, m, 1);
        const end = new Date(targetYear, m + 1, 0, 23, 59, 59);

        // Room booking revenue
        const bookingRevenueData = await RoomBooking.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    "payment.status": "Paid"
                }
            },
            {
                $group: { _id: null, total: { $sum: "$payment.totalAmount" } }
            }
        ]);
        const bookingRevenue = bookingRevenueData[0]?.total || 0;

        // Bar, Cafe, Restro revenue
        const barRevenue = await calculateRevenue(BarOrder, "baritems", start, end);
        const cafeRevenue = await calculateRevenue(CafeOrder, "cafeitems", start, end);
        const restroRevenue = await calculateRevenue(RestroOrder, "restaurantitems", start, end);

        const totalRevenue =
            bookingRevenue +
            (barRevenue[0]?.total || 0) +
            (cafeRevenue[0]?.total || 0) +
            (restroRevenue[0]?.total || 0);

        revenueByMonth.push({
            month: m + 1,
            totalRevenue
        });

        // Store current and previous month revenue based on targetMonth
        if (targetMonth !== null) {
            if (m === targetMonth) currentRevenue = totalRevenue;
            if (m === targetMonth - 1) prevRevenue = totalRevenue;
        }
    }

    // Handle Jan case for prevRevenue (Dec of previous year)
    if (targetMonth === 0) {
        const prevYear = parseInt(targetYear) - 1;
        const start = new Date(prevYear, 11, 1);
        const end = new Date(prevYear, 11 + 1, 0, 23, 59, 59);
        
        // Calculate only if needed
        const bookingRevenueData = await RoomBooking.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, "payment.status": "Paid" } },
            { $group: { _id: null, total: { $sum: "$payment.totalAmount" } } }
        ]);
        const bookingRevenue = bookingRevenueData[0]?.total || 0;
        const barRevenue = await calculateRevenue(BarOrder, "baritems", start, end);
        const cafeRevenue = await calculateRevenue(CafeOrder, "cafeitems", start, end);
        const restroRevenue = await calculateRevenue(RestroOrder, "restaurantitems", start, end);
        
        prevRevenue = bookingRevenue + (barRevenue[0]?.total || 0) + (cafeRevenue[0]?.total || 0) + (restroRevenue[0]?.total || 0);
    }

    return res.json({
        success: true,
        year: targetYear,
        revenueByMonth,
        currentRevenue,
        prevRevenue
    });
};

// REVENUE DASHBOARD (DETAILED SOURCE WISE)
exports.getRevenueDashboard = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({
                success: false,
                message: "month is required (format: YYYY-MM)"
            });
        }

        let [year, mon] = month.split("-");
        mon = Number(mon);

        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 0, 23, 59, 59);

        const prevMonth = mon === 1 ? 12 : mon - 1;
        const prevYear = mon === 1 ? year - 1 : year;

        const prevStart = new Date(prevYear, prevMonth - 1, 1);
        const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59);

        // Current month
        const barData = await calculateRevenue(BarOrder, "baritems", start, end);
        const cafeData = await calculateRevenue(CafeOrder, "cafeitems", start, end);
        const restroData = await calculateRevenue(RestroOrder, "restaurantitems", start, end);

        const roomData = await RoomBooking.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    "payment.status": "Paid"
                }
            },
            { $group: { _id: null, total: { $sum: "$payment.totalAmount" } } }
        ]);

        const bar = barData[0]?.total || 0;
        const cafe = cafeData[0]?.total || 0;
        const restro = restroData[0]?.total || 0;
        const room = roomData[0]?.total || 0;
        const currentTotal = bar + cafe + restro + room;

        // Previous month
        const prevBar = await calculateRevenue(BarOrder, "baritems", prevStart, prevEnd);
        const prevCafe = await calculateRevenue(CafeOrder, "cafeitems", prevStart, prevEnd);
        const prevRestro = await calculateRevenue(RestroOrder, "restaurantitems", prevStart, prevEnd);
        const prevRoom = await RoomBooking.aggregate([
            {
                $match: {
                    createdAt: { $gte: prevStart, $lte: prevEnd },
                    "payment.status": "Paid"
                }
            },
            { $group: { _id: null, total: { $sum: "$payment.totalAmount" } } }
        ]);

        const prevTotal =
            (prevBar[0]?.total || 0) +
            (prevCafe[0]?.total || 0) +
            (prevRestro[0]?.total || 0) +
            (prevRoom[0]?.total || 0);

        const diff = currentTotal - prevTotal;
        const percentChange = prevTotal ? ((diff / prevTotal) * 100).toFixed(1) : 0;

        return res.json({
            success: true,
            data: {
                totalRevenue: currentTotal,
                difference: diff,
                percentageChange: percentChange,
                breakdown: [
                    {
                        name: "Room Bookings",
                        amount: room,
                        percent: currentTotal ? ((room / currentTotal) * 100).toFixed(1) : 0,
                        trend: prevRoom[0]?.total
                            ? (((room - prevRoom[0]?.total) / prevRoom[0]?.total) * 100).toFixed(1)
                            : 0
                    },
                    {
                        name: "Cafe",
                        amount: cafe,
                        percent: currentTotal ? ((cafe / currentTotal) * 100).toFixed(1) : 0,
                        trend: prevCafe[0]?.total
                            ? (((cafe - prevCafe[0]?.total) / prevCafe[0]?.total) * 100).toFixed(1)
                            : 0
                    },
                    {
                        name: "Restaurant",
                        amount: restro,
                        percent: currentTotal ? ((restro / currentTotal) * 100).toFixed(1) : 0,
                        trend: prevRestro[0]?.total
                            ? (((restro - prevRestro[0]?.total) / prevRestro[0]?.total) * 100).toFixed(1)
                            : 0
                    },
                    {
                        name: "Bar",
                        amount: bar,
                        percent: currentTotal ? ((bar / currentTotal) * 100).toFixed(1) : 0,
                        trend: prevBar[0]?.total
                            ? (((bar - prevBar[0]?.total) / prevBar[0]?.total) * 100).toFixed(1)
                            : 0
                    }
                ]
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Service Requests
exports.serviceRequests = async (req, res) => {
    try {
        // ----- 1. COUNT STATUS WISE -----
        const pending = await Room.countDocuments({ cleanStatus: "Pending" });
        const inProgress = await Room.countDocuments({ cleanStatus: "In-Progress" });
        const completed = await Room.countDocuments({ cleanStatus: "Completed" });

        // ----- 2. LAST 3 CLEANING REQUESTS -----
        const latestRequests = await Room.find({
            cleanStatus: { $in: ["Pending", "In-Progress", "Completed","Dirty"] }
        })
            .sort({ updatedAt: -1 })  // latest first
            .limit(3)
            .populate("cleanassign", "name") // worker name if needed
            .select("roomNumber cleanStatus updatedAt cleanassign");

        return res.json({
            success: true,
            counts: {
                pending,
                inProgress,
                completed
            },
            latestRequests
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

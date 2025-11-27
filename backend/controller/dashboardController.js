const BarOrder = require('../models/barOrderModal');
const RestroOrder = require('../models/restaurantOrderModal');
const CafeOrder = require('../models/cafeOrderModal');
const RoomBooking = require("../models/bookingModel");
const Room = require("../models/createRoomModel");
const RoomType = require("../models/roomtypeModel");

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

function revenueTrend(model, itemCollection, match = {}) {
    return model.aggregate([
        { $match: match },
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
                _id: { $dayOfMonth: "$createdAt" },
                total: { $sum: { $multiply: ["$items.qty", "$productData.price"] } }
            }
        },

        { $sort: { "_id": 1 } }
    ]);
}

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
    const end = new Date(year, mon, 0);

    let prevYear = year;
    let prevMon = mon - 1;
    if (prevMon === 0) {
        prevMon = 12;
        prevYear -= 1;
    }
    const prevStart = new Date(prevYear, prevMon - 1, 1);
    const prevEnd = new Date(prevYear, prevMon, 0);

    // ================= 1. NEW BOOKINGS =================
    const newBookings = await RoomBooking.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const prevBookings = await RoomBooking.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
    const bookingTrend = await lineTrend(RoomBooking, { createdAt: { $gte: start, $lte: end } });

    // ================= 2. ROOM PIE BY ROOM TYPE =================
    const roomTypes = await RoomType.find(); // fetch all room types
    const roomPie = [];

    for (let rt of roomTypes) {
        const total = await Room.countDocuments({ roomType: rt._id });
        const booked = await RoomBooking.countDocuments({ status: "Booked", roomType: rt.roomType });
        const available = total - booked;

        roomPie.push({
            roomType: rt.roomType,
            booked,
            available
        });
    }

    // ================= 3. REVENUE BREAKDOWN =================
    const barRevenue = await revenueTrend(BarOrder, "baritems", { payment: "Paid", createdAt: { $gte: start, $lte: end } });
    const cafeRevenue = await revenueTrend(CafeOrder, "cafeitems", { payment: "Paid", createdAt: { $gte: start, $lte: end } });
    const restroRevenue = await revenueTrend(RestroOrder, "restroitems", { payment: "Paid", createdAt: { $gte: start, $lte: end } });

    // Room Booking revenue (assuming each booking has a `totalPrice`)
    const bookingRevenueData = await RoomBooking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: "Booked" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const bookingRevenue = bookingRevenueData[0]?.total || 0;

    // Total revenue per source
    const revenueSources = {
        bar: barRevenue.reduce((a, b) => a + b.total, 0),
        cafe: cafeRevenue.reduce((a, b) => a + b.total, 0),
        restro: restroRevenue.reduce((a, b) => a + b.total, 0),
        roomBooking: bookingRevenue
    };

    const totalRevenue = Object.values(revenueSources).reduce((a, b) => a + b, 0);

    // ================= 4. CHECKOUT =================
    const checkoutCount = await RoomBooking.countDocuments({ status: "Checkout" });
    const prevCheckout = await RoomBooking.countDocuments({ status: "Checkout", createdAt: { $gte: prevStart, $lte: prevEnd } });
    const checkoutChange = prevCheckout > 0 ? ((checkoutCount - prevCheckout) / prevCheckout) * 100 : 0;

    res.json({
        newBookings,
        bookingTrend,
        roomPie,            // roomPie grouped by roomType
        availableRooms: roomPie.reduce((a, r) => a + r.available, 0),
        revenue: totalRevenue,
        revenueSources,     // revenue per source: bar, cafe, restro, roomBooking
        checkoutCount,
        checkoutChange
    });
};



exports.getRevenueDashboard = async (req, res) => {
    try {
        const { month } = req.query; // Example => 2025-01
        if (!month) {
            return res.status(400).json({
                success: false,
                message: "month is required (format: YYYY-MM)"
            });
        }

        let [year, mon] = month.split("-");
        const prevMonth = `${year}-${String(mon - 1).padStart(2, "0")}`;

        const start = new Date(`${month}-01`);
        const end = new Date(`${month}-31`);

        const prevStart = new Date(`${prevMonth}-01`);
        const prevEnd = new Date(`${prevMonth}-31`);

        // -------------------------------
        // CURRENT MONTH CALCULATION
        // -------------------------------
        const barRevenue = await BarOrder.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    payment: "Paid"
                }
            },
            {
                $lookup: {
                    from: "baritems",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $addFields: {
                    totalAmountCalculated: {
                        $sum: {
                            $map: {
                                input: "$items",
                                as: "it",
                                in: {
                                    $multiply: [
                                        "$$it.qty",
                                        {
                                            $let: {
                                                vars: {
                                                    p: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$productDetails",
                                                                    as: "pd",
                                                                    cond: { $eq: ["$$pd._id", "$$it.product"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                },
                                                in: "$$p.price"
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmountCalculated" }
                }
            }
        ]);

        const cafeRevenue = await CafeOrder.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    payment: "Paid"
                }
            },

            { $unwind: "$items" },

            {
                $lookup: {
                    from: "cafeitems",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productData"
                }
            },

            { $unwind: "$productData" },

            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: ["$items.qty", "$productData.price"]
                        }
                    }
                }
            }
        ]);

        const restroRevenue = await RestroOrder.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    payment: "Paid"
                }
            },

            { $unwind: "$items" },

            {
                $lookup: {
                    from: "restroitems",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productData"
                }
            },

            { $unwind: "$productData" },

            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: ["$items.qty", "$productData.price"]
                        }
                    }
                }
            }
        ]);

        // 🔥 New Booking Schema: use payment.totalAmount & payment.status
        const roomRevenue = await RoomBooking.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    "payment.status": "Paid"
                }
            },
            { $group: { _id: null, total: { $sum: "$payment.totalAmount" } } }
        ]);

        const bar = barRevenue[0]?.total || 0;
        const cafe = cafeRevenue[0]?.total || 0;
        const restro = restroRevenue[0]?.total || 0;
        const room = roomRevenue[0]?.total || 0;

        const currentTotal = bar + cafe + restro + room;

        // -------------------------------
        // PREVIOUS MONTH CALCULATION
        // -------------------------------

        const prevBar = await BarOrder.aggregate([
            {
                $match: {
                    createdAt: { $gte: prevStart, $lte: prevEnd },
                    payment: "Paid"
                }
            },
            {
                $lookup: {
                    from: "baritems",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $addFields: {
                    totalAmountCalculated: {
                        $sum: {
                            $map: {
                                input: "$items",
                                as: "it",
                                in: {
                                    $multiply: [
                                        "$$it.qty",
                                        {
                                            $let: {
                                                vars: {
                                                    p: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$productDetails",
                                                                    as: "pd",
                                                                    cond: { $eq: ["$$pd._id", "$$it.product"] }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                },
                                                in: "$$p.price"
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmountCalculated" }
                }
            }
        ]);

        const prevCafe = await CafeOrder.aggregate([
            {
                $match: {
                    createdAt: { $gte: prevStart, $lte: prevEnd },
                    payment: "Paid"
                }
            },

            { $unwind: "$items" },

            {
                $lookup: {
                    from: "cafeitems",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productData"
                }
            },

            { $unwind: "$productData" },

            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: ["$items.qty", "$productData.price"]
                        }
                    }
                }
            }
        ]);

        const prevRestro = await RestroOrder.aggregate([
            {
                $match: {
                    createdAt: { $gte: prevStart, $lte: prevEnd },
                    payment: "Paid"
                }
            },

            { $unwind: "$items" },

            {
                $lookup: {
                    from: "restroitems",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productData"
                }
            },

            { $unwind: "$productData" },

            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: ["$items.qty", "$productData.price"]
                        }
                    }
                }
            }
        ]);

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

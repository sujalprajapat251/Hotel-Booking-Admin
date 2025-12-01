const CafeOrder = require('../models/cafeOrderModal');
const Staff = require('../models/staffModel');
const Department = require('../models/departmentModel');

// --------------------------------------------
// CAFE PRICE CALCULATION
// --------------------------------------------
function calculateCafeRevenue(start, end, fromType = null) {
    const matchQuery = {
        createdAt: { $gte: start, $lte: end },
        payment: "Paid"
    };

    if (fromType) matchQuery.from = fromType;

    return CafeOrder.aggregate([
        { $match: matchQuery },
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
                    $sum: { $multiply: ["$items.qty", "$productData.price"] }
                }
            }
        }
    ]);
}

// ------------------------------------------------------------
// REAL CAFE DASHBOARD API (WITH TOTAL CAFE STAFF)
// ------------------------------------------------------------
exports.CafeDashboard = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                success: false,
                message: "month is required (format: YYYY-MM)"
            });
        }

        // Current month range
        let [year, mon] = month.split("-").map(Number);
        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 0, 23, 59, 59);

        // --------------------------------------------
        // 1️⃣ CAFE + ROOM SERVICE ORDER COUNTS
        // --------------------------------------------
        const cafeOrders = await CafeOrder.countDocuments({
            createdAt: { $gte: start, $lte: end },
            payment: "Paid",
            from: "cafe"
        });

        const roomOrders = await CafeOrder.countDocuments({
            createdAt: { $gte: start, $lte: end },
            payment: "Paid",
            from: "room"
        });

        const newOrders = cafeOrders + roomOrders;

        // --------------------------------------------
        // 2️⃣ ORDER TREND
        // --------------------------------------------
        const cafeOrderTrend = await CafeOrder.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, payment: "Paid" } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const orderTrend = cafeOrderTrend.map(d => ({
            date: d._id,
            count: d.count
        }));

        // --------------------------------------------
        // 3️⃣ REVENUE SPLIT
        // --------------------------------------------
        const cafeRevenueData = await calculateCafeRevenue(start, end, "cafe");
        const cafeRevenue = cafeRevenueData[0]?.total || 0;

        const roomRevenueData = await calculateCafeRevenue(start, end, "room");
        const roomRevenue = roomRevenueData[0]?.total || 0;

        const totalCafeRevenue = cafeRevenue + roomRevenue;

        // --------------------------------------------
        // 4️⃣ STAFF → ONLY CAFÉ DEPARTMENT → DESIGNATION WISE + TOTAL
        // --------------------------------------------

        const cafeDepartment = await Department.findOne({ name: "Cafe" });

        let cafeStaff = {};
        let totalChefStaff = 0;

        if (cafeDepartment) {
            const staffGroup = await Staff.aggregate([
                { $match: { department: cafeDepartment._id } },
                {
                    $group: {
                        _id: "$designation",
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Convert array → object
            cafeStaff = staffGroup.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            // Total staff inside café department
            totalChefStaff = await Staff.countDocuments({
                department: cafeDepartment._id
            });
        }

        // --------------------------------------------
        // RESPONSE
        // --------------------------------------------
        return res.json({
            success: true,

            newOrders,
            totalOrder: newOrders,
            orderSources: {
                cafeOrders,
                roomOrders
            },
            orderTrend,

            totalCafeRevenue,
            revenueSources: {
                cafe: cafeRevenue,
                room: roomRevenue
            },

            totalChefStaff,
            cafeStaff,         
               
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

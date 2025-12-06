const CafeOrder = require('../models/cafeOrderModal');
const BarOrder = require('../models/barOrderModal');
const RestroOrder = require('../models/restaurantOrderModal');
const Staff = require('../models/staffModel');
const Department = require('../models/departmentModel');

// DEPARTMENT CONFIGURATION

const DEPARTMENT_CONFIG = {
    cafe: {
        orderModel: CafeOrder,
        itemCollection: "cafeitems",
        departmentName: "Cafe",
        fromValues: { direct: "cafe", room: "room" }
    },
    bar: {
        orderModel: BarOrder,
        itemCollection: "baritems",
        departmentName: "Bar",
        fromValues: { direct: "bar", room: "room" }
    },
    restaurant: {
        orderModel: RestroOrder,
        itemCollection: "restaurantitems",
        departmentName: "Restaurant",
        fromValues: { direct: "restaurant", room: "room" }
    }
};

// GENERIC REVENUE CALCULATION (FOR ALL DEPARTMENTS)

function calculateRevenue(orderModel, itemCollection, start, end, fromType = null) {
    const matchQuery = {
        createdAt: { $gte: start, $lte: end },
        payment: "Paid"
    };

    if (fromType) matchQuery.from = fromType;

    return orderModel.aggregate([
        { $match: matchQuery },
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
                total: {
                    $sum: { $multiply: ["$items.qty", "$productData.price"] }
                }
            }
        }
    ]);
}

// HELPER FUNCTION: GET DEPARTMENT CONFIG FROM USER

async function getDepartmentConfigFromUser(req) {
    if (!req.user) {
        return { error: { status: 401, message: 'Unauthorized' } };
    }

    const dept = await Department.findById(req.user.department);
    if (!dept || !dept.name) {
        return { error: { status: 400, message: 'User department not found' } };
    }

    const name = String(dept.name).trim().toLowerCase();
    let deptKey = null;
    
    if (name === 'cafe') deptKey = 'cafe';
    else if (name === 'bar') deptKey = 'bar';
    else if (name === 'restaurant' || name === 'restro') deptKey = 'restaurant';
    
    if (!deptKey || !DEPARTMENT_CONFIG[deptKey]) {
        return { error: { status: 400, message: `Unsupported department: ${dept.name}` } };
    }

    return { config: DEPARTMENT_CONFIG[deptKey], deptKey, departmentName: dept.name };
}

// DYNAMIC DEPARTMENT DASHBOARD API (CAFE, BAR, RESTAURANT)
exports.DepartmentDashboard = async (req, res) => {
    try {
        // Get department config from user
        const deptResult = await getDepartmentConfigFromUser(req);
        if (deptResult.error) {
            return res.status(deptResult.error.status).json({
                success: false,
                message: deptResult.error.message
            });
        }

        const { config, deptKey, departmentName } = deptResult;
        const { orderModel, itemCollection, fromValues } = config;

        // Validate month
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

        
        // 1️⃣ DIRECT + ROOM SERVICE ORDER COUNTS
        
        const directOrders = await orderModel.countDocuments({
            createdAt: { $gte: start, $lte: end },
            payment: "Paid",
            from: fromValues.direct
        });

        const roomOrders = await orderModel.countDocuments({
            createdAt: { $gte: start, $lte: end },
            payment: "Paid",
            from: fromValues.room
        });

        const newOrders = directOrders + roomOrders;

        // 2️⃣ ORDER TREND
        
        const orderTrendData = await orderModel.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, payment: "Paid" } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const orderTrend = orderTrendData.map(d => ({
            date: d._id,
            count: d.count
        }));
        
        // 3️⃣ REVENUE SPLIT
        
        const directRevenueData = await calculateRevenue(orderModel, itemCollection, start, end, fromValues.direct);
        const directRevenue = directRevenueData[0]?.total || 0;

        const roomRevenueData = await calculateRevenue(orderModel, itemCollection, start, end, fromValues.room);
        const roomRevenue = roomRevenueData[0]?.total || 0;

        const totalRevenue = directRevenue + roomRevenue;

        // 4️⃣ STAFF → DEPARTMENT WISE → DESIGNATION WISE + TOTAL
        
        const departmentDoc = await Department.findById(req.user.department);

        let departmentStaff = {};
        let totalStaff = 0;

        if (departmentDoc) {
            const staffGroup = await Staff.aggregate([
                { $match: { department: departmentDoc._id } },
                {
                    $group: {
                        _id: "$designation",
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Convert array → object
            departmentStaff = staffGroup.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            // Total staff inside department
            totalStaff = await Staff.countDocuments({
                department: departmentDoc._id
            });
        }

        // RESPONSE
        
        return res.json({
            success: true,
            department: deptKey,
            departmentName: departmentName,
            
            newOrders,
            totalOrder: newOrders,
            orderSources: {
                [departmentName]: directOrders,
                room: roomOrders
            },
            orderTrend,

            totalRevenue,
            revenueSources: {
                [departmentName]: directRevenue,
                room: roomRevenue
            },

            totalStaff,
            departmentStaff,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// PAYMENT METHOD WISE — REVENUE + COUNT (DYNAMIC)
exports.getDepartmentPaymentSummary = async (req, res) => {
    try {
        const deptResult = await getDepartmentConfigFromUser(req);
        if (deptResult.error) {
            return res.status(deptResult.error.status).json({
                success: false,
                message: deptResult.error.message
            });
        }

        const { config, deptKey } = deptResult;
        const { orderModel, itemCollection } = config;

        // Filter by month if provided
        const matchQuery = { payment: "Paid" };
        const { month } = req.query;
        
        if (month && /^\d{4}-\d{2}$/.test(month)) {
            const [year, mon] = month.split("-").map(Number);
            const start = new Date(year, mon - 1, 1);
            const end = new Date(year, mon, 0, 23, 59, 59);
            matchQuery.createdAt = { $gte: start, $lte: end };
        }

        const paymentSummary = await orderModel.aggregate([
            { $match: matchQuery },
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
                    fixedPaymentMethod: {
                        $cond: [
                            { $eq: ["$from", "room"] },
                            "card",
                            {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ["$paymentMethod", null] },
                                            { $eq: ["$paymentMethod", ""] },
                                            { $not: ["$paymentMethod"] }
                                        ]
                                    },
                                    "card",
                                    "$paymentMethod"
                                ]
                            }
                        ]
                    }
                }
            },

            {
                $group: {
                    _id: "$fixedPaymentMethod",
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: { $multiply: ["$items.qty", "$productData.price"] }
                    }
                }
            }
        ]);

        // Format result
        const formatted = {};

        paymentSummary.forEach(item => {
            const key = (item._id || "unknown").toLowerCase();
            formatted[key] = {
                orders: item.totalOrders,
                revenue: item.totalRevenue
            };
        });

        // Mandatory payment methods
        const defaultKeys = ["upi", "cash", "card"];

        defaultKeys.forEach(key => {
            if (!formatted[key]) {
                formatted[key] = { orders: 0, revenue: 0 };
            }
        });

        res.json({
            success: true,
            department: deptKey,
            paymentMethodSummary: formatted
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getDepartmentRevenueByMonth = async (req, res) => {
    try {
        // Get department config from user
        const deptResult = await getDepartmentConfigFromUser(req);
        if (deptResult.error) {
            return res.status(deptResult.error.status).json({
                success: false,
                message: deptResult.error.message
            });
        }

        const { config, deptKey } = deptResult;
        const { orderModel, itemCollection } = config;

        // Validate year
        const { year } = req.query;
        if (!year || !/^\d{4}$/.test(year)) {
            return res.status(400).json({
                success: false,
                message: "Year is required (format: YYYY)"
            });
        }

        const start = new Date(`${year}-01-01`);
        const end = new Date(`${year}-12-31T23:59:59`);

        const data = await orderModel.aggregate([
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
                    _id: { 
                        month: { $month: "$createdAt" }   // 1–12
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: ["$items.qty", "$productData.price"]
                        }
                    }
                }
            },

            { $sort: { "_id.month": 1 } }
        ]);

        // Convert array → readable format
        const formatted = Array.from({ length: 12 }, (_, i) => {
            const monthData = data.find(d => d._id.month === i + 1);
            return {
                month: i + 1,                           // 1 → Jan
                revenue: monthData ? monthData.totalRevenue : 0
            };
        });

        return res.json({
            success: true,
            department: deptKey,
            year,
            monthlyRevenue: formatted
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

 
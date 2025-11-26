const cafeTable = require("../models/cafeTableModel");
const barTable = require("../models/barTableModel");
const restroTable = require("../models/restaurantTableModel.js");

const cafeOrder = require('../models/cafeOrderModal');
const barOrder = require('../models/barOrderModal');
const restaurantOrder = require('../models/restaurantOrderModal');

// exports.createCafeTable = async (req, res) => {
//     try {
//         const { title, limit } = req.body;

//         if (!title || !limit) {
//             return res.status(400).json({
//                 status: 400,
//                 message: "All fields are required"
//             });
//         }

//         const newTable = await cafeTable.create({
//             title,
//             limit
//         });

//         res.status(200).json({
//             status: 200,
//             message: "Cafe Table created successfully..!",
//             data: newTable
//         });

//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// };

exports.createTable = async (req, res) => {
    try {
        const { title, limit } = req.body;

        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }

        if (!title || !limit) {
            return res.status(400).json({ status: 400, message: 'All fields are required' });
        }

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }

        const name = String(dept.name).trim().toLowerCase();
        let Model = null;

        if (name === 'cafe') {
            Model = cafeTable;
        } else if (name === 'bar') {
            Model = barTable;
        } else if (name === 'restaurant' || name === 'restro') {
            Model = restroTable;
        }

        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const newTable = await Model.create({ title, limit });

        return res.status(200).json({
            status: 200,
            message: 'Table created successfully..!',
            data: newTable,
            department: dept.name
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getTables = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }

        const name = String(dept.name).trim().toLowerCase();

        if (name === 'cafe') {
            const tables = await cafeTable.find();
            const results = await Promise.all(
                tables.map(async (tbl) => {
                    const lastOrder = await cafeOrder
                        .findOne({ from: 'cafe', table: tbl._id, payment: 'Pending' })
                        .sort({ createdAt: -1, _id: -1 })
                        .populate('items.product');
                    return {
                        ...tbl.toObject(),
                        lastUnpaidOrder: lastOrder ? { ...lastOrder.toObject(), orderId: lastOrder._id } : null
                    };
                })
            );
            return res.status(200).json({ status: 200, message: 'Tables fetched successfully', data: results });
        }

        let Model = null;
        if (name === 'bar') Model = barTable;
        else if (name === 'restaurant' || name === 'restro') Model = restroTable;

        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        if (name === 'bar') {
            const tables = await barTable.find();
            const results = await Promise.all(
                tables.map(async (tbl) => {
                    const lastOrder = await barOrder
                        .findOne({ from: 'bar', table: tbl._id, payment: 'Pending' })
                        .sort({ createdAt: -1, _id: -1 })
                        .populate('items.product');
                    return {
                        ...tbl.toObject(),
                        lastUnpaidOrder: lastOrder ? { ...lastOrder.toObject(), orderId: lastOrder._id } : null
                    };
                })
            );
            return res.status(200).json({ status: 200, message: 'Tables fetched successfully', data: results });
        }

        if (name === 'restaurant' || name === 'restro') {
            const tables = await restroTable.find();
            const results = await Promise.all(
                tables.map(async (tbl) => {
                    const lastOrder = await restaurantOrder
                        .findOne({ from: 'restaurant', table: tbl._id, payment: 'Pending' })
                        .sort({ createdAt: -1, _id: -1 })
                        .populate('items.product');
                    return {
                        ...tbl.toObject(),
                        lastUnpaidOrder: lastOrder ? { ...lastOrder.toObject(), orderId: lastOrder._id } : null
                    };
                })
            );
            return res.status(200).json({ status: 200, message: 'Tables fetched successfully', data: results });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getTableById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }

        const name = String(dept.name).trim().toLowerCase();

        if (name === 'cafe') {
            const table = await cafeTable.findById(req.params.id);
            if (!table) {
                return res.status(404).json({ status: 404, message: 'Table not found' });
            }
            const lastUnpaidOrder = await cafeOrder
                .findOne({ from: 'cafe', table: req.params.id, payment: 'Pending' })
                .sort({ createdAt: -1, _id: -1 })
                .populate({ path: 'items.product', model: 'cafeitem' });

            return res.status(200).json({ status: 200, data: table, order: lastUnpaidOrder });
        }

        let Model = null;
        if (name === 'bar') Model = barTable;
        else if (name === 'restaurant' || name === 'restro') Model = restroTable;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const table = await Model.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ status: 404, message: 'Table not found' });
        }

        if (name === 'bar') {
            const lastUnpaidOrder = await barOrder
                .findOne({ from: 'bar', table: req.params.id, payment: 'Pending' })
                .sort({ createdAt: -1, _id: -1 })
                .populate({ path: 'items.product', model: 'baritem' });
            return res.status(200).json({ status: 200, data: table, order: lastUnpaidOrder });
        }

        if (name === 'restaurant' || name === 'restro') {
            const lastUnpaidOrder = await restaurantOrder
                .findOne({ from: 'restaurant', table: req.params.id, payment: 'Pending' })
                .sort({ createdAt: -1, _id: -1 })
                .populate({ path: 'items.product', model: 'restaurantitem' });
            return res.status(200).json({ status: 200, data: table, order: lastUnpaidOrder });
        }

        return res.status(200).json({ status: 200, data: table });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.updateTable = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }

        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeTable;
        else if (name === 'bar') Model = barTable;
        else if (name === 'restaurant' || name === 'restro') Model = restroTable;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const updatedTable = await Model.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
        if (!updatedTable) {
            return res.status(404).json({ status: 404, message: 'Table not found' });
        }
        if (name === 'cafe') {
            const { emitCafeTableStatusChanged } = require('../socketManager/socketManager');
            emitCafeTableStatusChanged(updatedTable?._id || req.params.id, updatedTable);
        }
        return res.status(200).json({ status: 200, message: 'Table updated successfully..!', data: updatedTable });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.deleteTable = async (req, res) => {
    try {
        if (!req.user || req.user.designation !== 'Head of Department') {
            return res.status(403).json({ status: 403, message: 'Access denied! HOD only' });
        }

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }

        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeTable;
        else if (name === 'bar') Model = barTable;
        else if (name === 'restaurant' || name === 'restro') Model = restroTable;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const deletedTable = await Model.findByIdAndDelete(req.params.id);
        if (!deletedTable) {
            return res.status(404).json({ status: 404, message: 'Table not found' });
        }
        return res.status(200).json({ status: 200, message: 'Table deleted successfully..!' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};
// exports.getCafeTables = async (req, res) => {
//     try {
//         const tables = await cafeTable.find();

//         const results = await Promise.all(
//             tables.map(async (tbl) => {
//                 const lastOrder = await cafeOrder
//                     .findOne({
//                         from: 'cafe',
//                         table: tbl._id,
//                         payment: 'Pending'
//                     })
//                     .sort({ createdAt: -1, _id: -1 })
//                     .populate('items.product');
//                 return {
//                     ...tbl.toObject(),
//                     lastUnpaidOrder: lastOrder
//                         ? {
//                             ...lastOrder.toObject(),
//                             orderId: lastOrder._id,   // FIXED: correct order ID
//                         }
//                         : null
//                 };
//             })
//         );
        
//         res.status(200).json({
//             status: 200,
//             message: "Last unpaid orders for all tables fetched successfully..! ",
//             data: results
//         });

//     } catch (error) {
//         res.status(500).json({ status: 500, message: error.message });
//     }
// };

// exports.getCafeTableById = async (req, res) => {
//     try {
//         const table = await cafeTable.findById(req.params.id);
//         if (!table) {
//             return res.status(404).json({ status: 404, message: "Table not found" });
//         }
//         const lastUnpaidOrder = await cafeOrder
//             .findOne({ from: 'cafe', table: req.params.id, payment: 'Pending' })
//             .sort({ createdAt: -1, _id: -1 })
//             .populate({ path: 'items.product', model: 'cafeitem' });

//         res.status(200).json({ status: 200, data: table, order: lastUnpaidOrder });
//     } catch (error) {
//         res.status(500).json({ status: 500, message: error.message });
//     }
// };


// exports.updateCafeTable = async (req, res) => {
//     try {
//         const updatedTable = await cafeTable.findByIdAndUpdate(
//             req.params.id,
//             { ...req.body },
//             { new: true }
//         );
//         if (!updatedTable) {
//             return res.status(404).json({ status: 404, message: "Table not found" });
//         }
//         const { emitCafeTableStatusChanged } = require('../socketManager/socketManager');
//         emitCafeTableStatusChanged(updatedTable?._id || req.params.id, updatedTable);
//         res.status(200).json({
//             status: 200,
//             message: "Cafe Table updated successfully..!",
//             data: updatedTable
//         });
//     } catch (error) {
//         res.status(500).json({ status: 500, message: error.message });
//     }
// };


// exports.deleteCafeTable = async (req, res) => {
//     try {
//         const deletedTable = await cafeTable.findByIdAndDelete(req.params.id);
//         if (!deletedTable) {
//             return res.status(404).json({ status: 404, message: "Table not found" });
//         }
//         res.status(200).json({
//             status: 200,
//             message: "Cafe Table deleted successfully..!"
//         });
//     } catch (error) {
//         res.status(500).json({ status: 500, message: error.message });
//     }
// };


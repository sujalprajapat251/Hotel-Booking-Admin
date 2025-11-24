const cafeTable = require("../models/cafeTableModel");
const cafeOrder = require('../models/cafeOrderModal');

exports.createCafeTable = async (req, res) => {
    try {
        const { title, limit } = req.body;

        if (!title || !limit) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required"
            });
        }

        const newTable = await cafeTable.create({
            title,
            limit
        });

        res.status(200).json({
            status: 200,
            message: "Cafe Table created successfully..!",
            data: newTable
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};
exports.getCafeTables = async (req, res) => {
    try {
        const tables = await cafeTable.find();

        const results = await Promise.all(
            tables.map(async (tbl) => {
                const lastOrder = await cafeOrder
                    .findOne({
                        from: 'cafe',
                        table: tbl._id,
                        payment: 'Pending'
                    })
                    .sort({ createdAt: -1, _id: -1 })
                    .populate('items.product');
                return {
                    ...tbl.toObject(),
                    lastUnpaidOrder: lastOrder
                        ? {
                            ...lastOrder.toObject(),
                            orderId: lastOrder._id,   // FIXED: correct order ID
                        }
                        : null
                };
            })
        );
        
        res.status(200).json({
            status: 200,
            message: "Last unpaid orders for all tables fetched successfully..! ",
            data: results
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getCafeTableById = async (req, res) => {
    try {
        const table = await cafeTable.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ status: 404, message: "Table not found" });
        }
        const lastUnpaidOrder = await cafeOrder
            .findOne({ from: 'cafe', table: req.params.id, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 })
            .populate({ path: 'items.product', model: 'cafeitem' });

        res.status(200).json({ status: 200, data: table, order: lastUnpaidOrder });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.updateCafeTable = async (req, res) => {
    try {
        const updatedTable = await cafeTable.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );
        if (!updatedTable) {
            return res.status(404).json({ status: 404, message: "Table not found" });
        }
        const { emitCafeTableStatusChanged } = require('../socketManager/socketManager');
        emitCafeTableStatusChanged(updatedTable?._id || req.params.id, updatedTable);
        res.status(200).json({
            status: 200,
            message: "Cafe Table updated successfully..!",
            data: updatedTable
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.deleteCafeTable = async (req, res) => {
    try {
        const deletedTable = await cafeTable.findByIdAndDelete(req.params.id);
        if (!deletedTable) {
            return res.status(404).json({ status: 404, message: "Table not found" });
        }
        res.status(200).json({
            status: 200,
            message: "Cafe Table deleted successfully..!"
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


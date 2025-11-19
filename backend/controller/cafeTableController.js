const cafeTable = require("../models/cafeTableModel");

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
        res.status(200).json({
            status: 200,
            message: "Cafe Tables fetched successfully..!",
            data: tables
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
        res.status(200).json({ status: 200, data: table });
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


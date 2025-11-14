const TermCondition = require("../models/termsModel");

exports.createTermCondition = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and Description are required"
            });
        }

        const newData = await TermCondition.create({
            title,
            description
        });

        res.status(200).json({
            success: true,
            message: "Term & Condition created successfully..!",
            data: newData
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllTermConditions = async (req, res) => {
    try {
        const data = await TermCondition.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTermConditionById = async (req, res) => {
    try {
        const data = await TermCondition.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Term & Condition not found"
            });
        }

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTermCondition = async (req, res) => {
    try {
        const { title, description } = req.body;

        const updatedData = await TermCondition.findByIdAndUpdate(
            req.params.id,
            { title, description },
            { new: true, runValidators: true }
        );

        if (!updatedData) {
            return res.status(404).json({
                success: false,
                message: "Term & Condition not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Term & Condition updated successfully..!",
            data: updatedData
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTermCondition = async (req, res) => {
    try {
        const data = await TermCondition.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Term & Condition not found"
            });
        }

        await TermCondition.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Term & Condition deleted successfully..!"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

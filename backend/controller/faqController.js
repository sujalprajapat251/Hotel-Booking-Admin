const FAQ = require("../models/faqModel");

exports.createFAQ = async (req, res) => {
    try {
        const { faqQuestion, faqAnswer } = req.body;

        if (!faqQuestion || !faqAnswer) {
            return res.status(400).json({
                success: false,
                message: "FAQ question and answer are required"
            });
        }

        const newFAQ = await FAQ.create({ faqQuestion, faqAnswer });

        res.status(201).json({
            success: true,
            message: "FAQ created successfully..!",
            data: newFAQ
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllFAQ = async (req, res) => {
    try {
        const faqList = await FAQ.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: faqList
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFAQById = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        res.status(200).json({
            success: true,
            data: faq
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFAQ = async (req, res) => {
    try {
        const { faqQuestion, faqAnswer } = req.body;

        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            { faqQuestion, faqAnswer },
            { new: true, runValidators: true }
        );

        if (!updatedFAQ) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "FAQ updated successfully..!",
            data: updatedFAQ
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// DELETE FAQ
exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        await FAQ.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "FAQ deleted successfully..!"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Contact = require("../models/contactModel");

exports.createContact = async (req, res) => {
    try {
        const { name, email, mobileno, message } = req.body;

        const newContact = await Contact.create({
            name,
            email,
            mobileno,
            message
        });

        res.status(200).json({
            status: 200,
            message: "Contact saved successfully..!",
            data: newContact
        });

    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        });
    }
};

exports.getAllContact = async (req, res) => {
    try {
        const contact = await Contact.find(); 

        return res.status(200).json({
            status: 200,
            message: "All contact fetched successfully..!",
            contact,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

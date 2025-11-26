const AboutUs = require("../models/aboutModel");
const { deleteFromS3, uploadToS3 } = require("../utils/s3Service");

exports.createAbout = async (req, res) => {
    try {
        const { title, subtitle, description } = req.body;

        if (!title ||  !description) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required"
            });
        }

        let uploadedUrl = null;
        if(req.file){
            uploadedUrl = await uploadToS3(req.file, "uploads/image");
        }

        const newAbout = await AboutUs.create({
            title,
            subtitle,
            description,
            image: uploadedUrl ? uploadedUrl : null
        });

        res.status(200).json({
            status: 200,
            message: "about created successfully..!",
            data: newAbout
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};

// GET ALL BLOGS
exports.getAllAbout = async (req, res) => {
    try {
        const about = await AboutUs.find();

        res.status(200).json({
            status:200,
            success: true,
            message: "All About fetched successfully..!",
            data: about
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BLOG BY ID
exports.getAboutById = async (req, res) => {
    try {
        const about = await AboutUs.findById(req.params.id);

        if (!about) {
            return res.status(404).json({status:404, success: false, message: "About not found" });
        }

        res.status(200).json({
            status:200,
            success: true,
            message: "Single About fetched successfully..!",
            data: about
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE BLOG
exports.updateAbout = async (req, res) => {
    try {
        const { title, subtitle, description } = req.body;

        const about = await AboutUs.findById(req.params.id);

        if (!about) {
            return res.status(404).json({status:404, success: false, message: "About not found" });
        }

        about.title = title || about.title;
        about.subtitle = subtitle || about.subtitle;
        about.description = description || about.description;

        if (req.file) {
            if (about.image) await deleteFromS3(about.image);
            about.image = await uploadToS3(req.file, "uploads/image");
        }

        const updatedabout = await about.save();

        res.status(200).json({
            status:200,
            success: true,
            message: "about updated successfully..!",
            data: updatedabout
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE BLOG
exports.deleteAbout = async (req, res) => {
    try {
        const about = await AboutUs.findById(req.params.id);

        if (!about) {
            return res.status(404).json({status:400, success: false, message: "About not found" });
        }

        if (about.image) {
            await deleteFromS3(about.image);
        }

        await AboutUs.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status:200,
            success: true,
            message: "About deleted successfully..!"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


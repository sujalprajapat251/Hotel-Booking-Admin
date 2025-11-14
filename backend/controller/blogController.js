const Blog = require("../models/blogModel");

exports.createBlog = async (req, res) => {
    try {
        const { title, subtitle, tag, description } = req.body;

        if (!title || !subtitle || !tag || !description) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required"
            });
        }

        const newBlog = await Blog.create({
            title,
            subtitle,
            tag,
            description,
            image: req.file ? req.file.path : null
        });

        res.status(200).json({
            status: 200,
            message: "Blog created successfully..!",
            data: newBlog
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};

// GET ALL BLOGS
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();

        res.status(200).json({
            status:200,
            success: true,
            message: "All Blog fetched successfully..!",
            data: blogs
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BLOG BY ID
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({status:404, success: false, message: "Blog not found" });
        }

        res.status(200).json({
            status:200,
            success: true,
            message: "Single Blog fetched successfully..!",
            data: blog
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE BLOG
exports.updateBlog = async (req, res) => {
    try {
        const { title, subtitle, tag, description } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({status:404, success: false, message: "Blog not found" });
        }

        blog.title = title || blog.title;
        blog.subtitle = subtitle || blog.subtitle;
        blog.tag = tag || blog.tag;
        blog.description = description || blog.description;

        if (req.file) {
            blog.image = req.file.path;
        }

        const updatedBlog = await blog.save();

        res.status(200).json({
            status:200,
            success: true,
            message: "Blog updated successfully..!",
            data: updatedBlog
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE BLOG
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({status:400, success: false, message: "Blog not found" });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status:200,
            success: true,
            message: "Blog deleted successfully..!"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


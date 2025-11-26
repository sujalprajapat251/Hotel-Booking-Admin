const Blog = require("../models/blogModel");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Service");

exports.createBlog = async (req, res) => {
    try {
        const { title, subtitle, tag, description } = req.body;

        if (!title || !subtitle || !tag || !description) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required"
            });
        }
        let uploadedUrl = null;
        if(req.file){
            uploadedUrl = await uploadToS3(req.file, "uploads/image");
        }

        const newBlog = await Blog.create({
            title,
            subtitle,
            tag,
            description,
            image: uploadedUrl ? uploadedUrl : null
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
        const blogData = await Blog.find().sort({ readcount: -1 });

        if (!blogData.length) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "No blogs found",
                data: []
            });
        }

        const top10Blogs = blogData.slice(0, 10);
        const top10Ids = top10Blogs.map(b => b._id.toString());

        await Blog.updateMany(
            { _id: { $in: top10Ids } },
            { $set: { status: "trending" } }
        );

        await Blog.updateMany(
            { _id: { $nin: top10Ids } },
            { $set: { status: null } }
        );

        const finalBlogs = blogData.map(blog => ({
            ...blog._doc,
            status: top10Ids.includes(blog._id.toString()) ? "trending" : null
        }));

        res.status(200).json({
            status: 200,
            success: true,
            message: "Blogs fetched with top 10 trending applied",
            data: finalBlogs
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
            if (blog.image) await deleteFromS3(blog.image);
            blog.image = await uploadToS3(req.file, "uploads/image");
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

        if (blog.image) {
            await deleteFromS3(blog.image);
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

// readcount blog
exports.getBlogReadcountById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Blog not found"
            });
        }

        blog.readcount = (blog.readcount || 0) + 1;
        await blog.save();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Single Blog fetched successfully..!",
            data: blog
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BLOGS BY TAG
exports.getBlogsByTag = async (req, res) => {
    try {
        const { tag } = req.params;

        const blogs = await Blog.find({ tag: tag });

        return res.status(200).json({
            status: 200,
            success: true,
            message: `${tag} blogs fetched successfully..!`,
            data: blogs
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


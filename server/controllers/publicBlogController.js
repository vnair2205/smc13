// server/controllers/publicBlogController.js
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');

exports.getPublicBlogs = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = {};
        if (category) query.category = category;
        if (search) query.title = { $regex: search, $options: 'i' };

        const blogs = await Blog.find(query).populate('category', 'name').sort({ blogDate: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getPublicBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('category', 'name');
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getPublicBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};
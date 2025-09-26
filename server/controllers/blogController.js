// server/controllers/blogController.js
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Setup for Thumbnail Upload ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/blogs';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage }).single('thumbnail');

exports.uploadThumbnail = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message });
        }
        next();
    });
};

// --- Controller Functions ---
exports.getBlogs = async (req, res) => {
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

exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('category', 'name');
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.addBlog = async (req, res) => {
    const { title, category, youtubeUrl, blogDate, content } = req.body;
    if (!req.file) {
        return res.status(400).json({ msg: 'Thumbnail image is required' });
    }

    try {
        const newBlog = new Blog({
            title,
            category,
            youtubeUrl,
            blogDate,
            content,
            thumbnail: req.file.path,
        });
        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateBlog = async (req, res) => {
    const { title, category, youtubeUrl, blogDate, content } = req.body;
    let updateData = { title, category, youtubeUrl, blogDate, content };

    if (req.file) {
        updateData.thumbnail = req.file.path;
        // Optionally, delete the old thumbnail
    }

    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ msg: 'Blog not found' });
        
        // Optionally, delete the thumbnail file from storage
        if (fs.existsSync(blog.thumbnail)) {
            fs.unlinkSync(blog.thumbnail);
        }

        await blog.remove();
        res.json({ msg: 'Blog removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};
// server/routes/blog.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { getBlogs, getBlogById, addBlog, updateBlog, deleteBlog, uploadThumbnail } = require('../controllers/blogController');

router.use(adminAuth);

router.route('/').get(getBlogs).post(uploadThumbnail, addBlog);
router.route('/:id').get(getBlogById).put(uploadThumbnail, updateBlog).delete(deleteBlog);

module.exports = router;
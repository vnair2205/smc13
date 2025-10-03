// server/routes/publicBlog.js
const express = require('express');
const router = express.Router();
const { getPublicBlogs, getPublicBlogById, getPublicBlogCategories } = require('../controllers/publicBlogController');

router.get('/', getPublicBlogs);
router.get('/categories', getPublicBlogCategories);
router.get('/:id', getPublicBlogById);

module.exports = router;
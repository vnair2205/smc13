// server/controllers/blogCategoryController.js
const BlogCategory = require('../models/BlogCategory');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = new BlogCategory({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        await category.remove();
        res.json({ msg: 'Category removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};
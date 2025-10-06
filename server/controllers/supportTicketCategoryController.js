// server/controllers/supportTicketCategoryController.js
const SupportTicketCategory = require('../models/SupportTicketCategory');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await SupportTicketCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = new SupportTicketCategory({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Category already exists' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await SupportTicketCategory.find({ isPublic: true }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const category = await SupportTicketCategory.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await SupportTicketCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    await category.remove();
    res.json({ msg: 'Category removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};
// server/controllers/knowledgebaseCategoryController.js
const KnowledgebaseCategory = require('../models/KnowledgebaseCategory');

// @desc    Get all categories
// @route   GET /api/knowledgebase/category
exports.getCategories = async (req, res) => {
  try {
    const categories = await KnowledgebaseCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Add a new category
// @route   POST /api/knowledgebase/category
exports.addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    let category = await KnowledgebaseCategory.findOne({ name });
    if (category) {
      return res.status(400).json({ msg: 'Category already exists' });
    }
    const newCategory = new KnowledgebaseCategory({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update a category
// @route   PUT /api/knowledgebase/category/:id
exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  try {
    let category = await KnowledgebaseCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    category.name = name;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/knowledgebase/category/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await KnowledgebaseCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    await category.remove();
    res.json({ msg: 'Category removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};
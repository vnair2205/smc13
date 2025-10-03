// server/controllers/publicKnowledgebaseController.js
const KnowledgebaseCategory = require('../models/KnowledgebaseCategory');
const KnowledgebaseArticle = require('../models/KnowledgebaseArticle');

// @desc    Get all public categories
// @route   GET /api/public/kb/categories
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await KnowledgebaseCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get all public articles with filtering
// @route   GET /api/public/kb/articles
exports.getPublicArticles = async (req, res) => {
  try {
     const { category, search } = req.query; // Add 'search' to destructuring
    const query = {};
    if (category) {
      query.category = category;
    }

     if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const articles = await KnowledgebaseArticle.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get a single public article by ID
// @route   GET /api/public/kb/articles/:id
exports.getPublicArticleById = async (req, res) => {
  try {
    const article = await KnowledgebaseArticle.findById(req.params.id)
      .populate('category', 'name');
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};
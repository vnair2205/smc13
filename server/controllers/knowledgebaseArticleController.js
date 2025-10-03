// server/controllers/knowledgebaseArticleController.js
const KnowledgebaseArticle = require('../models/KnowledgebaseArticle');

// @desc    Get all articles with filtering and search
// @route   GET /api/knowledgebase/article
exports.getArticles = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const articles = await KnowledgebaseArticle.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
      
    res.json(articles);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Add a new article
// @route   POST /api/knowledgebase/article
exports.addArticle = async (req, res) => {
  const { title, category, youtubeUrl, content } = req.body;
  try {
    const newArticle = new KnowledgebaseArticle({
      title,
      category,
      youtubeUrl,
      content
    });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update an article
// @route   PUT /api/knowledgebase/article/:id
exports.updateArticle = async (req, res) => {
  try {
    const article = await KnowledgebaseArticle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete an article
// @route   DELETE /api/knowledgebase/article/:id
exports.deleteArticle = async (req, res) => {
  try {
    const article = await KnowledgebaseArticle.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }
    await article.remove();
    res.json({ msg: 'Article removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getArticleById = async (req, res) => {
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
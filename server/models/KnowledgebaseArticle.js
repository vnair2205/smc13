// server/models/KnowledgebaseArticle.js
const mongoose = require('mongoose');

const KnowledgebaseArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgebaseCategory',
    required: true
  },
  youtubeUrl: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KnowledgebaseArticle', KnowledgebaseArticleSchema);
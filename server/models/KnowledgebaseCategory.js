// server/models/KnowledgebaseCategory.js
const mongoose = require('mongoose');

const KnowledgebaseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KnowledgebaseCategory', KnowledgebaseCategorySchema);
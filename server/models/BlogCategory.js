// server/models/BlogCategory.js
const mongoose = require('mongoose');

const BlogCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BlogCategory', BlogCategorySchema);
// server/models/Blog.js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogCategory',
    required: true
  },
  youtubeUrl: {
    type: String,
    trim: true,
    default: ''
  },
  thumbnail: {
    type: String, // We will store the path to the uploaded image
    required: true
  },
  blogDate: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', BlogSchema);
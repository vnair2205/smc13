// server/models/SupportTicketCategory.js
const mongoose = require('mongoose');

const SupportTicketCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SupportTicketCategory', SupportTicketCategorySchema);
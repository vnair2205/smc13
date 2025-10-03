// server/models/PreGenSubCategory1.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PreGenSubCategory1Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PreGenCategory',
    required: true,
  }
}, { timestamps: true });

// Ensure a subcategory name is unique within its parent category
PreGenSubCategory1Schema.index({ name: 1, parentCategory: 1 }, { unique: true });

PreGenSubCategory1Schema.plugin(mongoosePaginate);
module.exports = mongoose.model('PreGenSubCategory1', PreGenSubCategory1Schema);
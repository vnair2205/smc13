// server/models/PreGenCategory.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PreGenCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  }
}, { timestamps: true });

PreGenCategorySchema.plugin(mongoosePaginate);
module.exports = mongoose.model('PreGenCategory', PreGenCategorySchema);
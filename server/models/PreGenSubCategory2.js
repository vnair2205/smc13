// server/models/PreGenSubCategory2.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PreGenSubCategory2Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  parentSubCategory1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PreGenSubCategory1',
    required: true,
  }
}, { timestamps: true });

// Ensure a subcategory name is unique within its parent subcategory
PreGenSubCategory2Schema.index({ name: 1, parentSubCategory1: 1 }, { unique: true });

PreGenSubCategory2Schema.plugin(mongoosePaginate);
module.exports = mongoose.model('PreGenSubCategory2', PreGenSubCategory2Schema);
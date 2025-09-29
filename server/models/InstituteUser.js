const mongoose = require('mongoose');

const instituteUserSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  guardian: {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String },
  }
}, { timestamps: true });

module.exports = mongoose.model('InstituteUser', instituteUserSchema);
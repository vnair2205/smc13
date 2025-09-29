const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const InstituteUserSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
    },
    guardian: {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String },
        password: { type: String },
        phone: { type: String },
    }
}, { timestamps: true });

InstituteUserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('InstituteUser', InstituteUserSchema);
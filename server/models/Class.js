const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
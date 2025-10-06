const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const InstituteAdminSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});

InstituteAdminSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('InstituteAdmin', InstituteAdminSchema);
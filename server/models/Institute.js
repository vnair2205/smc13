const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const InstituteSchema = new mongoose.Schema({
    instituteName: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        pinCode: String,
    },
    institutePhoneNumber: String,
    instituteEmail: {
        type: String,
        required: true,
        unique: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin', // --- FIX: Changed from 'User' to 'InstituteAdmin'
        required: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstitutePlan',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});

InstituteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Institute', InstituteSchema);
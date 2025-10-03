const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const InstitutePlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a plan name'],
        trim: true,
    },
    duration: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'],
        required: [true, 'Please provide a plan duration'],
    },
    adminCoursesPerMonth: {
        type: Number,
        required: [true, 'Please specify the number of admin courses per month'],
    },
    userCoursesPerMonth: {
        type: Number,
        required: [true, 'Please specify the number of user courses per month'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});

InstitutePlanSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('InstitutePlan', InstitutePlanSchema);
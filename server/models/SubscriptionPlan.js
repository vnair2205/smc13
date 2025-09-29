// server/models/SubscriptionPlan.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SubscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a plan name'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please provide a plan amount'],
    },
    coursesPerMonth: {
        type: Number,
        required: [true, 'Please specify the number of courses per month'],
    },
    subtopicsPerCourse: {
        type: Number,
        required: [true, 'Please specify the number of subtopics per course'],
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // --- FIX: The razorpayPlanId field has been completely removed ---
}, {
    timestamps: true
});

SubscriptionPlanSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);


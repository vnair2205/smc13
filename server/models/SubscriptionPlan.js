// server/models/SubscriptionPlan.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  coursesPerMonth: {
    type: Number,
    required: true,
  },
  subtopicsPerCourse: {
    type: Number,
    required: true,
    enum: [5, 10, 15],
  },
  razorpayPlanId: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // *** NEW FIELD ADDED HERE ***
  isPublic: {
    type: Boolean,
    default: true, // Plans are public by default
  },
}, { timestamps: true });

SubscriptionPlanSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
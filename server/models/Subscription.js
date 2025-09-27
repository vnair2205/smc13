// server/models/Subscription.js
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  coursesGenerated: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// --- ADD THIS PLUGIN FOR AUTO-INCREMENTING ID ---
SubscriptionSchema.plugin(AutoIncrement, { inc_field: 'subscriptionId' });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
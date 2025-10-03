const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const AdminReferralSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
  },
  referredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true
});

AdminReferralSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('AdminReferral', AdminReferralSchema);
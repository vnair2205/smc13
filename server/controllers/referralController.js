const AdminReferral = require('../models/AdminReferral');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const crypto = require('crypto');

// @route   POST api/referrals/admin
// @desc    Create a new admin referral
// @access  Private (Admin)
exports.createAdminReferral = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, planId, discountAmount } = req.body;

  try {
    // Check if a referral with this email already exists
    let existingReferral = await AdminReferral.findOne({ email });
    if (existingReferral) {
      return res.status(400).json({ msg: 'A referral with this email already exists.' });
    }

    // --- START: FIX ---
    // Generate a unique referral code *before* using it
    const referralCode = crypto.randomBytes(8).toString('hex');
    // --- END: FIX ---

    const newReferral = new AdminReferral({
      firstName,
      lastName,
      email,
      phoneNumber,
      plan: planId,
      discountAmount,
      referralCode, // Now this variable exists
    });

    await newReferral.save();

    // Populate the 'plan' field to include its details in the response
    const populatedReferral = await AdminReferral.findById(newReferral._id).populate('plan');

    res.status(201).json(populatedReferral);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// @route   GET api/referrals/admin
// @desc    Get all admin referrals with pagination and search
// @access  Private (Admin)
exports.getAdminReferrals = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: 'plan',
      sort: { createdAt: -1 },
    };

    const referrals = await AdminReferral.paginate(query, options);
    res.json(referrals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
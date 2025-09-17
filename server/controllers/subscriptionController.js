// server/controllers/subscriptionController.js
const SubscriptionPlan = require('../models/SubscriptionPlan');

// @route   POST api/subscriptions
// @desc    Create a new subscription plan
// @access  Private (Admin)
exports.createPlan = async (req, res) => {
  try {
    const { name, amount, coursesPerMonth, subtopicsPerCourse, razorpayPlanId, isPublic } = req.body;
    const newPlan = new SubscriptionPlan({
      name,
      amount,
      coursesPerMonth,
      subtopicsPerCourse,
      razorpayPlanId,
      isPublic,
    });
    const plan = await newPlan.save();
    res.status(201).json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/subscriptions
// @desc    Get all active subscription plans (for Admin)
// @access  Private (Admin)
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// *** FIX: ADDED THIS NEW FUNCTION TO FETCH PUBLIC PLANS ***
// @route   GET api/subscriptions/public
// @desc    Get all public-facing, active subscription plans
// @access  Public
exports.getPublicPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true, isPublic: true }).sort({ amount: 1 });
    res.json(plans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @route   PUT api/subscriptions/:id
// @desc    Update a subscription plan
// @access  Private (Admin)
exports.updatePlan = async (req, res) => {
  try {
    const { name, amount, coursesPerMonth, subtopicsPerCourse, razorpayPlanId, isPublic } = req.body;
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { $set: { name, amount, coursesPerMonth, subtopicsPerCourse, razorpayPlanId, isPublic } },
      { new: true }
    );
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });
    res.json(plan);
  } catch (err)
  {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/subscriptions/:id
// @desc    Delete a subscription plan (soft delete)
// @access  Private (Admin)
exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });
    res.json({ msg: 'Plan deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
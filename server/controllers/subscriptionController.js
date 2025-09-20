// server/controllers/subscriptionController.js
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

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


// --- NEW FUNCTION ---
// @route   GET api/subscriptions/history
// @desc    Get current user's subscription history
// @access  Private
exports.getSubscriptionHistory = async (req, res) => {
    try {
        // --- FIX STARTS HERE ---
        // The fix is in how we populate the user's active subscription.
        // We need to first populate the 'activeSubscription', and then populate the 'plan' within it.
        const user = await User.findById(req.user.id).populate({
            path: 'activeSubscription',
            populate: {
                path: 'plan',
                model: 'SubscriptionPlan'
            }
        });
        // --- FIX ENDS HERE ---

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const totalSubscriptions = await Subscription.countDocuments({ user: req.user.id });

        const subscriptions = await Subscription.find({ user: req.user.id })
            .populate('plan') // This part was already correct for the history table
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(limit);

        let currentPlanData = null;
        // Now, this check will work correctly because the data is properly populated.
        if (user.activeSubscription && user.activeSubscription.plan) {
            currentPlanData = {
                name: user.activeSubscription.plan.name,
                endDate: user.activeSubscription.endDate,
            };
        }

        res.json({
            subscriptions,
            totalSubscriptions,
            currentPlan: currentPlanData,
            currentPage: page,
            totalPages: Math.ceil(totalSubscriptions / limit),
        });

    } catch (error) {
        console.error('Error fetching subscription history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// --- NEW FUNCTION ---
// @route   GET api/subscriptions/invoice/:id
// @desc    Get details for a single invoice
// @access  Private
exports.getInvoiceDetails = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('plan user');

        if (!subscription) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }
        
        res.json(subscription);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
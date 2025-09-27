// server/controllers/subscriptionController.js
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @route   POST api/subscriptions
// @desc    Create a new subscription plan
// @access  Private (Admin)
exports.createPlan = async (req, res) => {
  try {
    // --- FIX: Ensure razorpayPlanId is not read from the body ---
    const { name, amount, coursesPerMonth, subtopicsPerCourse, isPublic } = req.body;
    
    const newPlan = new SubscriptionPlan({
      name,
      amount,
      coursesPerMonth,
      subtopicsPerCourse,
      isPublic,
    });
    
    const plan = await newPlan.save();
    res.status(201).json(plan);
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: err.message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/subscriptions
// @desc    Get all subscription plans for the Admin panel
// @access  Private (Admin)
exports.getAllPlans = async (req, res) => {
  try {
    // --- FIX: Changed to find() to allow admins to see both active and inactive plans ---
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

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
    // --- FIX: Removed razorpayPlanId and added isActive for admin control ---
    const { name, amount, coursesPerMonth, subtopicsPerCourse, isPublic, isActive } = req.body;
    
    const updatedFields = {
        name,
        amount,
        coursesPerMonth,
        subtopicsPerCourse,
        isPublic,
        isActive, // Allows admin to reactivate a plan
    };

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    if (!plan) return res.status(404).json({ msg: 'Plan not found' });
    res.json(plan);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/subscriptions/:id
// @desc    Deactivate a subscription plan (soft delete)
// @access  Private (Admin)
exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } }, // This correctly deactivates the plan
      { new: true }
    );
    if (!plan) return res.status(404).json({ msg: 'Plan not found' });
    
    // --- FIX: Changed message to reflect deactivation ---
    res.json({ msg: 'Plan deactivated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/subscriptions/history
// @desc    Get current user's subscription history
// @access  Private
exports.getSubscriptionHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'activeSubscription',
            populate: {
                path: 'plan',
                model: 'SubscriptionPlan'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const totalSubscriptions = await Subscription.countDocuments({ user: req.user.id });

        const subscriptions = await Subscription.find({ user: req.user.id })
            .populate('plan')
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(limit);

        let currentPlanData = null;
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


exports.getSubscriptionStatus = async (req, res) => {
  try {
    // --- FIX: This logic is now more robust ---
    const user = await User.findById(req.user.id).populate({
      path: 'activeSubscription',
      model: 'Subscription' // Explicitly specify the model
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Default to inactive
    let isActive = false;
    let subscription = user.activeSubscription;

    // Check all conditions for an active subscription
    if (subscription && 
        subscription.status === 'active' && 
        new Date(subscription.endDate) > new Date()) {
      isActive = true;
    }

    res.json({ isActive });

  } catch (err) {
    console.error(`Error in getSubscriptionStatus: ${err.message}`);
    res.status(500).send('Server Error');
  }
};

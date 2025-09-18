// server/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');
const useragent = require('useragent');
const geoip = require('geoip-lite');

// ... (instance and getSessionDetails function remain the same)
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getSessionDetails = (req) => {
    const agent = useragent.parse(req.headers['user-agent']);
    const ip = req.ip === '::1' ? '127.0.0.1' : (req.ip || req.connection.remoteAddress);
    const geo = geoip.lookup(ip);
    const location = (ip === '127.0.0.1') ? 'Localhost' : (geo ? `${geo.city}, ${geo.region}, ${geo.country}` : 'Unknown Location');
    return { ipAddress: ip, device: `${agent.toAgent()} on ${agent.os.toString()}`, location };
};


// @route   POST api/payments/create-order
exports.createOrder = async (req, res) => {
    // ... (this function remains the same)
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: 'Email is required.' });
        }
        const user = await User.findOne({ email }).populate('selectedPlan');
        if (!user || !user.selectedPlan) {
            return res.status(404).json({ msg: 'User or selected plan not found.' });
        }
        const options = {
            amount: user.selectedPlan.amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: user._id.toString(),
                planId: user.selectedPlan._id.toString(),
            }
        };
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/payments/verify-payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ msg: 'Payment verification failed.' });
        }

        const user = await User.findOne({ email }).populate('selectedPlan');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const newSubscription = new Subscription({
            user: user._id,
            plan: user.selectedPlan._id,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            endDate,
            status: 'active',
        });
        await newSubscription.save();

        user.activeSubscription = newSubscription._id;
        user.subscriptionStatus = 'active';
        
        // --- FIX: Set the initial course credits based on the plan ---
        user.coursesRemaining = user.selectedPlan.coursesPerMonth;

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        
        user.activeSession = { token, ...getSessionDetails(req) };
        await user.save();

        res.json({ token, msg: 'Payment successful! Your account is now active.' });

    } catch (err) {
        console.error("Verify Payment Error:", err);
        res.status(500).send('Server Error');
    }
};
// server/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');
const useragent = require('useragent');
const geoip = require('geoip-lite');

// --- FIX: ADDED CHECK FOR API KEYS ---
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("FATAL ERROR: Razorpay API keys are not defined in the server's .env file.");
}

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


exports.createOrder = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('selectedPlan');

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        if (!user.selectedPlan) {
            return res.status(400).json({ msg: 'No plan selected for this user.' });
        }

        const plan = user.selectedPlan;

        // --- FIX: GENERATE A SHORTER RECEIPT ID ---
        const receiptId = `receipt_${crypto.randomBytes(10).toString('hex')}`;

        const options = {
            amount: plan.amount * 100, // Amount in paise
            currency: 'INR',
            receipt: receiptId, // Use the new, shorter receipt ID
        };

        const order = await instance.orders.create(options);
        res.json(order);

    } catch (err) {
        // This will now log the detailed Razorpay error
        console.error('Error creating order:', err);
        res.status(500).send('Server Error');
    }
};

// ... (verifyPayment and verifyUpgrade functions remain unchanged)

exports.verifyPayment = async (req, res) => {
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
    user.coursesRemaining = user.selectedPlan.coursesPerMonth;
    
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
    
    user.sessions.push({ token, ...getSessionDetails(req) });
    user.activeSession = user.sessions[user.sessions.length - 1];
    await user.save();

    res.json({ token, msg: 'Payment successful! Your account is now active.' });
};

exports.verifyUpgrade = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ msg: 'Payment verification failed.' });
    }

    const user = await User.findById(req.user.id);
    const plan = await SubscriptionPlan.findById(planId);

    if (!user || !plan) {
        return res.status(404).json({ msg: 'User or Plan not found.' });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const newSubscription = new Subscription({
        user: user._id,
        plan: plan._id,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        endDate,
        status: 'active',
    });
    await newSubscription.save();

    user.activeSubscription = newSubscription._id;
    user.subscriptionStatus = 'active';
    user.coursesRemaining = plan.coursesPerMonth;
    
    await user.save();

    res.json({ success: true, msg: 'Subscription upgraded successfully!' });
};
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

exports.handleSubscriptionRenewal = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    console.log('[Webhook] Received a new webhook from Razorpay.');

    try {
        // 1. Verify the webhook signature to ensure it's from Razorpay
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            console.error('[Webhook] Error: Invalid signature. Access denied.');
            return res.status(403).json({ msg: 'Invalid signature' });
        }

        console.log('[Webhook] Signature verified successfully.');
        const event = req.body;

        // 2. Check if this is the "subscription charged" event
        if (event.event === 'subscription.charged') {
            const subscriptionData = event.payload.subscription.entity;
            const paymentData = event.payload.payment.entity;

            // 3. Find the user associated with this subscription
            const user = await User.findOne({ razorpaySubscriptionId: subscriptionData.id }).populate('activeSubscription.plan');
            if (!user) {
                console.error(`[Webhook] Error: User not found for Razorpay subscription ID: ${subscriptionData.id}`);
                return res.status(404).send('User not found');
            }
            console.log(`[Webhook] User found: ${user.email}`);

            const plan = user.activeSubscription.plan;
            if (!plan) {
                 console.error(`[Webhook] Error: Active plan not found for user: ${user.email}`);
                return res.status(404).send('Plan not found');
            }

            // 4. Create a new subscription record for the new billing cycle
            const newEndDate = new Date();
            newEndDate.setMonth(newEndDate.getMonth() + 1); // Set for one month from now

            const newSubscription = new Subscription({
                user: user._id,
                plan: plan._id,
                razorpay_payment_id: paymentData.id,
                razorpay_order_id: paymentData.order_id,
                razorpay_signature: 'Verified by Webhook', // Signature is different for webhooks
                startDate: new Date(),
                endDate: newEndDate,
                status: 'active',
            });
            await newSubscription.save();
            console.log(`[Webhook] New subscription record created for user: ${user.email}`);

            // 5. Update the user's account with the new subscription and reset their course quota
            user.activeSubscription = newSubscription._id;
            user.subscriptionStatus = 'active';
            user.coursesRemaining = plan.coursesPerMonth; // Reset the quota
            await user.save();
            
            console.log(`[Webhook] User ${user.email} subscription renewed. Quota reset to ${plan.coursesPerMonth}.`);
        }

        // 6. Acknowledge receipt of the webhook
        res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error('[Webhook] Server error:', error.message);
        res.status(500).send('Server Error');
    }
};


exports.createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        console.log('[Payment] Attempting to create order for planId:', planId);

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            console.error('[Payment] Error: Plan not found for planId:', planId);
            return res.status(404).json({ msg: 'Plan not found' });
        }

        const options = {
            amount: plan.amount * 100, // Amount in paisa
            currency: 'INR',
            receipt: crypto.randomBytes(10).toString('hex'),
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                // --- FIX: ADDED DETAILED ERROR LOGGING ---
                console.error('[Payment] Razorpay order creation failed:', error);
                return res.status(500).json({ msg: 'Failed to create payment order with provider.' });
            }
            console.log('[Payment] Razorpay order created successfully:', order.id);
            res.status(200).json({ order });
        });
    } catch (err) {
        // --- FIX: ADDED DETAILED ERROR LOGGING ---
        console.error('[Payment] Server error in createOrder function:', err);
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
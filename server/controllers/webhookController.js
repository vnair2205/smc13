// server/controllers/webhookController.js
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan'); // <-- ADD THIS LINE

exports.handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'subscription.charged') {
            const razorpaySubscriptionId = payload.subscription.entity.id;
            const paymentId = payload.payment.entity.id;

            const user = await User.findOne({ razorpaySubscriptionId });

            if (user && user.activeSubscription) {
                const plan = await SubscriptionPlan.findById(user.selectedPlan);
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);

                // Create a new subscription record for the new billing cycle
                const newSubscription = new Subscription({
                    user: user._id,
                    plan: user.selectedPlan,
                    razorpay_payment_id: paymentId,
                    razorpay_order_id: payload.payment.entity.order_id,
                    razorpay_signature: "webhook-generated", // Or some other placeholder
                    endDate,
                    status: 'active',
                    coursesGenerated: 0 // Reset the course count
                });
                await newSubscription.save();

                // Update the user's active subscription to the new one
                user.activeSubscription = newSubscription._id;
                user.subscriptionStatus = 'active';
                await user.save();
            }
        }

        if (event === 'subscription.halted') {
            const razorpaySubscriptionId = payload.subscription.entity.id;
            const user = await User.findOne({ razorpaySubscriptionId });

            if (user) {
                user.subscriptionStatus = 'inactive'; // Mark the user as inactive
                await user.save();

                // Also update the subscription status to 'cancelled'
                await Subscription.findByIdAndUpdate(user.activeSubscription, { status: 'cancelled' });
            }
        }
        
        res.status(200).json({ status: 'ok' });
    } else {
        res.status(403).send('Invalid signature');
    }
};
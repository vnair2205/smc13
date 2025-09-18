// server/controllers/webhookController.js
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

exports.handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'subscription.charged') {
            const subscriptionId = payload.subscription.id;
            const paymentId = payload.payment.entity.id;

            const subscription = await Subscription.findOne({ 'razorpay_subscription_id': subscriptionId }).populate('plan');
            if (subscription) {
                const user = await User.findById(subscription.user);
                
                // Reset course credits
                user.coursesRemaining = subscription.plan.coursesPerMonth;
                
                // Create new subscription record for the new month
                const newEndDate = new Date(subscription.endDate);
                newEndDate.setMonth(newEndDate.getMonth() + 1);

                const newSubscription = new Subscription({
                    user: user._id,
                    plan: subscription.plan._id,
                    razorpay_payment_id: paymentId,
                    // ... other details
                    endDate: newEndDate,
                });
                await newSubscription.save();

                user.activeSubscription = newSubscription._id;
                await user.save();
            }
        }

        if (event === 'subscription.halted') {
            const subscriptionId = payload.subscription.id;
            const subscription = await Subscription.findOne({ 'razorpay_subscription_id': subscriptionId });
            if (subscription) {
                const user = await User.findById(subscription.user);
                user.subscriptionStatus = 'inactive';
                await user.save();
            }
        }
        
        res.status(200).json({ status: 'ok' });
    } else {
        res.status(403).send('Invalid signature');
    }
};
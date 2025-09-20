// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, verifyUpgrade, handleSubscriptionRenewal } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// --- UNPROTECTED ROUTES ---

// For initial signup and manual upgrades
router.post('/create-order', auth, createOrder); // Should be protected to know who is ordering
router.post('/verify-payment', verifyPayment); // For initial signup
router.post('/verify-upgrade', auth, verifyUpgrade); // For logged-in upgrades

// --- NEW WEBHOOK ROUTE ---
// This is a public route for Razorpay to send automated notifications.
// It uses a different method for verification (webhook secret).
router.post('/webhook/razorpay', handleSubscriptionRenewal);


module.exports = router;
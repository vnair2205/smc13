// server/routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const { handleRazorpayWebhook } = require('../controllers/webhookController');

// This route does not need auth middleware as it's called by Razorpay
router.post('/razorpay', handleRazorpayWebhook);

module.exports = router;
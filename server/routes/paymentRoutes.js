// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, verifyUpgrade } = require('../controllers/paymentController');
const auth = require('../middleware/auth'); // Import auth middleware

// @route   POST api/payments/create-order
router.post('/create-order', createOrder);

// @route   POST api/payments/verify-payment
router.post('/verify-payment', verifyPayment);
router.post('/verify-upgrade', auth, verifyUpgrade);

module.exports = router;
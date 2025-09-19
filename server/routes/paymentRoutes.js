// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// @route   POST api/payments/create-order
router.post('/create-order', createOrder);

// @route   POST api/payments/verify-payment
router.post('/verify-payment', verifyPayment);

module.exports = router;
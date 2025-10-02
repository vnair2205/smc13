const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const adminAuth = require('../middleware/adminAuth');

// @route   POST api/referrals/admin
// @desc    Create a new admin referral
// @access  Private (Admin)
router.post('/admin', adminAuth, referralController.createAdminReferral);

// @route   GET api/referrals/admin
// @desc    Get all admin referrals
// @access  Private (Admin)
router.get('/admin', adminAuth, referralController.getAdminReferrals);

module.exports = router;
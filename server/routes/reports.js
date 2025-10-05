// server/routes/reports.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

const { getUserReport } = require('../controllers/reportController');

// @route   GET /api/reports/user
// @desc    Get user report
// @access  Private (Admin)
router.get('/user', adminAuth, getUserReport);

module.exports = router;
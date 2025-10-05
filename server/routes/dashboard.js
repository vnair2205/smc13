// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { getDashboardAnalytics } = require('../controllers/dashboardController');

// --- ADD THIS NEW ROUTE ---
// @route   GET /api/dashboard/analytics
// @desc    Get all data for the main admin dashboard
// @access  Private (Admin)
router.get('/analytics', adminAuth, getDashboardAnalytics);

module.exports = router;
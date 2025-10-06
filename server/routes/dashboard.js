const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getDashboardData, 
    getWelcomeData, 
    getProgressData,
    getDashboardAnalytics // 2. Import the new admin function
} = require('../controllers/dashboardController');

const adminAuth = require('../middleware/adminAuth');

router.get('/', auth, getDashboardData);

// This route now matches the new controller function and the API call from the client
router.get('/welcome-data', auth, getWelcomeData);

router.get('/progress-data', auth, getProgressData);

router.get('/analytics', adminAuth, getDashboardAnalytics);

module.exports = router;
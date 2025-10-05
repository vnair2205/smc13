const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDashboardData, getWelcomeData, getProgressData } = require('../controllers/dashboardController');

router.get('/', auth, getDashboardData);

// This route now matches the new controller function and the API call from the client
router.get('/welcome-data', auth, getWelcomeData);

router.get('/progress-data', auth, getProgressData);

module.exports = router;
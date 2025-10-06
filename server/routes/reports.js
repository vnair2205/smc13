// server/routes/reports.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

const { 
    getUserReport, 
    getSubscriptionReport,
    getPregeneratedCourseReport,      
    getPregeneratedCourseAccessDetails,
     getCourseReport,
     getCertificateReport,
      getChurnReport,
      getDroppedCustomersReport
} = require('../controllers/reportController');

// @route   GET /api/reports/user
// @desc    Get user report
// @access  Private (Admin)
router.get('/user', adminAuth, getUserReport);


router.get('/subscription', adminAuth, getSubscriptionReport);

router.get('/pregenerated', adminAuth, getPregeneratedCourseReport);

router.get('/pregenerated/:id', adminAuth, getPregeneratedCourseAccessDetails);

router.get('/courses', adminAuth, getCourseReport);

router.get('/certificates', adminAuth, getCertificateReport);

router.get('/churn', adminAuth, getChurnReport);

router.get('/dropped-customers', adminAuth, getDroppedCustomersReport);

module.exports = router;
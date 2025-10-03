const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { createInstitute, getInstitutes, getInstituteStats } = require('../controllers/instituteController');

// --- Admin Protected Routes ---
router.post('/', adminAuth, createInstitute);
router.get('/', adminAuth, getInstitutes);
router.get('/stats', adminAuth, getInstituteStats);

module.exports = router;
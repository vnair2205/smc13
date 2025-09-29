const express = require('express');
const router = express.Router();
const { getLegalContent, updateLegalContent } = require('../controllers/legalController');

// You need to secure the POST route with your existing admin authentication middleware.
// I'm assuming you have middleware files like 'auth.js' and 'admin.js'.
// const auth = require('../middleware/auth');
// const admin = require('../middleware/admin');

// @route   GET api/legal
// @desc    Get legal content
// @access  Public
router.get('/', getLegalContent);

// @route   POST api/legal
// @desc    Update legal content
// @access  Private (Admin)
// router.post('/', [auth, admin], updateLegalContent);

// For now, I'm leaving the POST route unprotected. 
// PLEASE ADD YOUR AUTH MIDDLEWARE as shown in the commented-out line above.
router.post('/', updateLegalContent);


module.exports = router;
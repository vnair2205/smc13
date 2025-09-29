const express = require('express');
const router = express.Router();
const instituteUserController = require('../controllers/instituteUserController');

// --- THIS IS THE FINAL FIX ---
// The middleware was being imported with curly braces {}, which is incorrect for this module.
// This corrected line imports the middleware function directly.
const adminAuth = require('../middleware/adminAuth');

router.post('/', adminAuth, instituteUserController.createInstituteUser);
// Add GET, PUT, and DELETE routes

module.exports = router;
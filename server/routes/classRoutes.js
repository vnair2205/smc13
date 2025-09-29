const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// --- THIS IS THE FIX ---
// The middleware is exported directly, so it must be imported without curly braces {}.
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/classes/institute/:instituteId
// @desc    Get all classes for an institute
// @access  Private (Admin)
router.get('/institute/:instituteId', adminAuth, classController.getClassesByInstitute);

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private (Admin)
router.post('/', adminAuth, classController.createClass);

// Add PUT and DELETE routes here

module.exports = router;
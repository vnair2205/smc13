const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/sections/institute/:instituteId
// @desc    Get all sections for an institute
// @access  Private (Admin)
router.get('/institute/:instituteId', adminAuth, sectionController.getSectionsByInstitute);

// @route   POST /api/sections
// @desc    Create a new section
// @access  Private (Admin)
router.post('/', adminAuth, sectionController.createSection);

// Add PUT and DELETE routes here

module.exports = router;
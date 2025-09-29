const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/subjects/institute/:instituteId
// @desc    Get all subjects for an institute
// @access  Private (Admin)
router.get('/institute/:instituteId', adminAuth, subjectController.getSubjectsByInstitute);

// @route   POST /api/subjects
// @desc    Create a new subject
// @access  Private (Admin)
router.post('/', adminAuth, subjectController.createSubject);

// Add PUT and DELETE routes here

module.exports = router;
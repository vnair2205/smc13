const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // User auth
const preGenCourseController = require('../controllers/preGenCourseController');

// All routes are protected by standard user auth
router.use(auth);

// Get all pre-generated courses with filters
router.get('/', preGenCourseController.getPublicPreGenCourses);

// Get course counts per category
router.get('/category-counts', preGenCourseController.getCategoryCounts);

// Get a single pre-gen course for the overview page
router.get('/:id', preGenCourseController.getPreGenCourseById); // Re-uses admin controller

// "Start" a course (enroll)
router.post('/:id/start', preGenCourseController.startCourse);

module.exports = router;
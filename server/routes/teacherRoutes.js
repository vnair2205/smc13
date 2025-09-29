const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
// --- THIS IS THE FIX ---
const adminAuth = require('../middleware/adminAuth');

router.get('/institute/:instituteId', adminAuth, teacherController.getTeachersByInstitute);
router.post('/', adminAuth, teacherController.createTeacher);
// Add PUT and DELETE routes

module.exports = router;
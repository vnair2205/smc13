const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const preGenCourseController = require('../controllers/preGenCourseController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(adminAuth);

// Get all pre-generated courses (paginated)
router.get('/', preGenCourseController.getPreGenCourses);

// Get a single pre-generated course by its ID
router.get('/:id', preGenCourseController.getPreGenCourseById);

// Generate a new single pre-generated course from form data
router.post('/generate', preGenCourseController.createPreGenCourse);

// Generate multiple courses from a CSV file
router.post('/bulk-generate', upload.single('file'), preGenCourseController.bulkGenerateCourses);

// --- NEW: Delete Route ---
router.delete('/:id', preGenCourseController.deletePreGenCourse);


module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');

// Configure multer for file uploads (remains the same)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// --- Authentication Routes ---
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password/:token', adminController.resetPassword);

// --- Team Management Routes ---
router.post('/team-members', [adminAuth, upload.single('profilePicture')], adminController.addTeamMember);
router.get('/team-members', adminAuth, adminController.getTeamMembers);
router.put('/team-members/:id', [adminAuth, upload.single('profilePicture')], adminController.updateTeamMember);
router.delete('/team-members/:id', adminAuth, adminController.deleteTeamMember);

// --- User Management Routes ---
router.get('/users/stats', adminAuth, adminController.getUserStats);
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:id', adminAuth, adminController.getUserDetails);
router.put('/users/:id', adminAuth, adminController.updateUserDetails);
router.post('/users/change-plan', adminAuth, adminController.changeUserPlan);
router.post('/users/add-course-count', adminAuth, adminController.addCourseCount);

// @route   GET api/admin/users/:userId/courses
// @desc    Get all courses for a specific user (self-generated and pre-generated)
// @access  Private (Admin)
// --- THIS IS THE CORRECTED ROUTE ---
router.get('/users/:userId/courses', adminAuth, adminController.getUserAllCourses);


// --- Course Management Routes for Admin ---

// @route   GET api/admin/courses/:courseId
// @desc    Admin gets details of a specific self-generated course
// @access  Private (Admin)
router.get('/courses/:courseId', adminAuth, adminController.getCourseDetails);

// @route   GET api/admin/users/:userId/courses/:courseId
// @desc    Admin gets a specific course's progress for a specific user
// @access  Private (Admin)
router.get('/users/:userId/courses/:courseId', adminAuth, adminController.getCourseForUser);

// @route   GET api/admin/users/:userId/courses/:courseId/chat
// @desc    Admin gets the chat history for a specific user in a specific course
// @access  Private (Admin)
router.get('/users/:userId/courses/:courseId/chat', adminAuth, adminController.getChatForUserCourse);

router.get('/user-courses', adminAuth, adminController.getUserGeneratedCourses);

router.get('/course-details/:courseId', adminAuth, adminController.getCourseDetailsForAdmin);




module.exports = router;
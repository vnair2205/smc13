// server/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// @route   POST api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', adminController.login);

// @route   POST api/admin/forgot-password
// @desc    Admin forgot password
// @access  Public
router.post('/forgot-password', adminController.forgotPassword);

// @route   POST api/admin/reset-password/:token
// @desc    Admin reset password
// @access  Public
router.post('/reset-password/:token', adminController.resetPassword);

// @route   POST api/admin/team-members
// @desc    Add a new team member
// @access  Private
router.post('/team-members', [adminAuth, upload.single('profilePicture')], adminController.addTeamMember);

// @route   GET api/admin/team-members
// @desc    Get all team members
// @access  Private
router.get('/team-members', adminAuth, adminController.getTeamMembers);

// @route   PUT api/admin/team-members/:id
// @desc    Update a team member
// @access  Private
router.put('/team-members/:id', [adminAuth, upload.single('profilePicture')], adminController.updateTeamMember);

// @route   DELETE api/admin/team-members/:id
// @desc    Delete a team member
// @access  Private
router.delete('/team-members/:id', adminAuth, adminController.deleteTeamMember);


// @route   GET api/admin/users/stats
// @desc    Get user statistics
// @access  Private (Admin)
router.get('/users/stats', adminAuth, adminController.getUserStats);

// @route   GET api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin)
router.get('/users', adminAuth, adminController.getUsers);

// @route   GET api/admin/users/:id
// @desc    Get user details by ID
// @access  Private (Admin)
router.get('/users/:id', adminAuth, adminController.getUserDetails);

// @route   POST api/admin/users/change-plan
// @desc    Change a user's subscription plan
// @access  Private (Admin)
router.post('/users/change-plan', adminAuth, adminController.changeUserPlan);

// @route   POST api/admin/users/add-course-count
// @desc    Add to a user's course generation quota
// @access  Private (Admin)
router.post('/users/add-course-count', adminAuth, adminController.addCourseCount);




module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getProfile,
    updatePersonalInfo,
    updateLearnsProfile,
    updateProfilePicture,
    changePassword // Import the new controller function
} = require('../controllers/profileController');

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, getProfile);

// @route   PUT api/profile/personal
// @desc    Update personal info
// @access  Private
router.put('/personal', auth, updatePersonalInfo);

// @route   PUT api/profile/learns
// @desc    Update LEARNS profile
// @access  Private
router.put('/learns', auth, updateLearnsProfile);

// @route   POST api/profile/picture
// @desc    Update profile picture
// @access  Private
router.post('/picture', auth, updateProfilePicture);

// ** NEW ROUTE **
// @route   POST api/profile/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, changePassword);

module.exports = router;
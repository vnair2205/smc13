// server/routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    forceLoginUser,
    logoutUser,
    verifyPhoneOtp,
    verifyEmailOtp,
    checkEmailExists,
    checkPhoneExists,
    resendPhoneOtp,
    updateAndResendPhoneOtp,
    resendEmailOtp,
    updateAndResendEmailOtp,
    forgotPassword,
    resetPassword,
    getUserStats, // New route
    getProfile, // New route
    updatePersonalInfo, // New route
    updateBio, // New route
    updateLearnsProfile, // New route
    uploadProfilePicture // New route
} = require('../controllers/authController');

console.log('auth middleware type:', typeof auth);
console.log('registerUser type:', typeof registerUser);
console.log('loginUser type:', typeof loginUser);
console.log('forceLoginUser type:', typeof forceLoginUser);
console.log('logoutUser type:', typeof logoutUser);
console.log('verifyPhoneOtp type:', typeof verifyPhoneOtp);
console.log('verifyEmailOtp type:', typeof verifyEmailOtp);
console.log('checkEmailExists type:', typeof checkEmailExists);
console.log('checkPhoneExists type:', typeof checkPhoneExists);
console.log('resendPhoneOtp type:', typeof resendPhoneOtp);
console.log('updateAndResendPhoneOtp type:', typeof updateAndResendPhoneOtp);
console.log('resendEmailOtp type:', typeof resendEmailOtp);
console.log('updateAndResendEmailOtp type:', typeof updateAndResendEmailOtp);
console.log('forgotPassword type:', typeof forgotPassword);
console.log('resetPassword type:', typeof resetPassword);
console.log('getUserStats type:', typeof getUserStats);
console.log('getProfile type:', typeof getProfile);
console.log('updatePersonalInfo type:', typeof updatePersonalInfo);
console.log('updateBio type:', typeof updateBio);
console.log('updateLearnsProfile type:', typeof updateLearnsProfile);
console.log('uploadProfilePicture type:', typeof uploadProfilePicture);


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/force-login', forceLoginUser);
router.post('/logout', auth, logoutUser);
router.post('/verify-phone', auth, verifyPhoneOtp);
router.post('/verify-email', auth, verifyEmailOtp);
router.post('/resend-phone-otp', auth, resendPhoneOtp);
router.post('/update-phone', auth, updateAndResendPhoneOtp);
router.post('/resend-email-otp', auth, resendEmailOtp);
router.post('/update-email', auth, updateAndResendEmailOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/check-email', checkEmailExists);
router.post('/check-phone', checkPhoneExists);

// --- NEW PROFILE ROUTES ---
router.get('/profile/stats', auth, getUserStats);
router.get('/profile', auth, getProfile);
router.put('/profile/personal', auth, updatePersonalInfo);
router.put('/profile/bio', auth, updateBio);
router.put('/profile/learns', auth, updateLearnsProfile);


console.log('Type of router before export in auth.js:', typeof router);

module.exports = router;    
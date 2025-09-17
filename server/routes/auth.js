// server/routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    // Signup Flow
    registerUser,
    verifySignupPhone,
    verifySignupEmail,
    resendSignupPhoneOtp,
    resendSignupEmailOtp,
    changeSignupPhone,
    changeSignupEmail,

    // Login/Logout
    loginUser,
    forceLoginUser,
    logoutUser,

    // Profile Page Updates (Authenticated)
    verifyPhoneOtp,
    verifyEmailOtp,
    updateAndResendPhoneOtp,
    updateAndResendEmailOtp,

    // Utilities & Password Reset
    checkEmailExists,
    checkPhoneExists,
    forgotPassword,
    resetPassword,

    // Profile Data (Authenticated)
    getUserStats,
    getProfile,
    updatePersonalInfo,
    updateBio,
    updateLearnsProfile,
    uploadProfilePicture
} = require('../controllers/authController');

// --- UNPROTECTED ROUTES ---

// Step 1: User Registration
router.post('/register', registerUser);

// Step 2 & 3: Signup Verification
router.post('/verify-signup-phone', verifySignupPhone);
router.post('/verify-signup-email', verifySignupEmail);

// Resend OTP for Signup
router.post('/resend-signup-phone-otp', resendSignupPhoneOtp);
router.post('/resend-signup-email-otp', resendSignupEmailOtp);

// Change Contact Info During Signup
router.post('/change-signup-phone', changeSignupPhone);
router.post('/change-signup-email', changeSignupEmail);

// Standard Login & Util
router.post('/login', loginUser);
router.post('/force-login', forceLoginUser);
router.post('/check-email', checkEmailExists);
router.post('/check-phone', checkPhoneExists);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


// --- PROTECTED ROUTES (Require Authentication) ---

router.post('/logout', auth, logoutUser);

// Profile page: update phone/email
router.post('/update-phone', auth, updateAndResendPhoneOtp);
router.post('/verify-phone', auth, verifyPhoneOtp);
router.post('/update-email', auth, updateAndResendEmailOtp);
router.post('/verify-email', auth, verifyEmailOtp);

// Profile Data routes
router.get('/profile/stats', auth, getUserStats);
router.get('/profile', auth, getProfile);
router.put('/profile/personal', auth, updatePersonalInfo);
router.put('/profile/bio', auth, updateBio);
router.put('/profile/learns', auth, updateLearnsProfile);
router.post('/profile/picture', auth, uploadProfilePicture);

module.exports = router;
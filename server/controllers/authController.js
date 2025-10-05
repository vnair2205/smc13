// server/controllers/authController.js
const User = require('../models/User');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');
const useragent = require('useragent');
const geoip = require('geoip-lite');
const path = require('path');
const fs = require('fs');

// --- TWILIO CLIENT SETUP ---
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const client = twilio(accountSid, authToken);


// --- FIX STARTS HERE ---
// Add this block to verify your environment variables are loaded correctly on server start.
console.log("--- TWILIO CREDENTIALS CHECK ---");
console.log("Account SID Loaded:", !!accountSid); 
console.log("Auth Token Loaded:", !!authToken);
console.log("Messaging Service SID Loaded:", !!messagingServiceSid);
console.log("---------------------------------");
// --- FIX ENDS HERE ---

const getSessionDetails = (req) => {
    const agent = useragent.parse(req.headers['user-agent']);
    const ip = req.ip === '::1' ? '127.0.0.1' : (req.ip || req.connection.remoteAddress);
    const geo = geoip.lookup(ip);
    const location = (ip === '127.0.0.1') ? 'Localhost' : (geo ? `${geo.city}, ${geo.region}, ${geo.country}` : 'Unknown Location');
    return { ipAddress: ip, device: `${agent.toAgent()} on ${agent.os.toString()}`, location };
};

const generateAndSendEmailOtp = async (user, targetEmail) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

   const mailOptions = {
        from: `SeekMyCourse <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: 'Your OTP for SeekMyCourse',
        text: `Your One-Time Password (OTP) is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
};




// --- *** NEW: TWILIO OTP SEND FUNCTION *** ---
const sendPhoneOtpWithTwilio = async (phoneNumber) => {
    try {
        console.log(`Sending Twilio OTP to ${phoneNumber}...`);
        await client.verify.v2.services(messagingServiceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });
        
        console.log("Twilio OTP request sent successfully.");
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP via Twilio:', error.message);
        // Map Twilio's error codes to your app's error messages if needed
        if (error.code === 60200) { // Invalid parameter
             return { success: false, error: 'Invalid phone number provided.' };
        }
        return { success: false, error: 'Failed to send OTP.' };
    }
};

exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber, dateOfBirth, planId } = req.body;
    try {
        const existingVerifiedUser = await User.findOne({
            $or: [{ email, isEmailVerified: true }, { phoneNumber, isPhoneVerified: true }]
        });
        if (existingVerifiedUser) {
            return res.status(400).json({ msgKey: existingVerifiedUser.email === email ? 'errors.email_exists' : 'errors.phone_exists' });
        }
        let user = await User.findOne({ email });
        if (user) {
            user.firstName = firstName;
            user.lastName = lastName;
            user.password = password;
            user.phoneNumber = phoneNumber;
            user.dateOfBirth = dateOfBirth;
            user.selectedPlan = planId;
            user.subscriptionStatus = 'pending_payment';
            user.isPhoneVerified = false;
            user.isEmailVerified = false;
        } else {
            user = new User({
                firstName, lastName, email, password, phoneNumber, dateOfBirth,
                selectedPlan: planId,
                subscriptionStatus: 'pending_payment'
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const otpResult = await sendPhoneOtpWithTwilio(phoneNumber);
        if (!otpResult.success) {
            return res.status(500).json({ msgKey: 'errors.otp_failed_send', error: otpResult.error });
        }
        res.status(201).json({ msg: 'Registration successful. Please verify your phone number.', email: user.email, phone: user.phoneNumber });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};


exports.resendSignupPhoneOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const user = await User.findOne({ phoneNumber });
        if (!user) return res.status(404).json({ msg: 'User not found.' });
        const otpResult = await sendPhoneOtpWithTwilio(phoneNumber);
        if (!otpResult.success) {
            return res.status(500).json({ msg: 'Failed to resend OTP.' });
        }
        res.status(200).json({ msg: 'A new OTP has been sent to your phone.' });
    } catch (err) {
        console.error('Resend Signup Phone OTP Error:', err);
        res.status(500).json({ msg: 'Failed to resend OTP.' });
    }
};


// --- TWILIO PHONE VERIFICATION LOGIC ---
exports.verifySignupPhone = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        console.log(`Verifying OTP ${otp} for ${phoneNumber} with Twilio...`);
        const verification_check = await client.verify.v2.services(messagingServiceSid)
            .verificationChecks
            .create({ to: phoneNumber, code: otp });
        if (verification_check.status === 'approved') {
            console.log("Twilio verification successful.");
            const user = await User.findOne({ phoneNumber: phoneNumber });
            if (!user) {
                return res.status(404).json({ msg: 'User not found after verification.' });
            }
            user.isPhoneVerified = true;
            user.phoneOtp = undefined;
            user.phoneOtpExpires = undefined;
            await generateAndSendEmailOtp(user, user.email);
            await user.save();
            res.json({ msg: 'Phone verified successfully. Please check your email for the next OTP.' });
        } else {
            console.log("Twilio verification failed. Status:", verification_check.status);
            res.status(400).json({ msg: 'Invalid or expired phone OTP.' });
        }
    } catch (err) {
        console.error('Twilio Phone Verification Error:', err.message);
        if (err.code === 20404) {
            return res.status(400).json({ msg: 'Verification failed. The OTP may have expired.' });
        }
        res.status(500).send('Server error');
    }
};
// *** NEW FUNCTION for verifying email and finalizing signup ***
exports.verifySignupEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found. Please try signing up again.' });
        if (!user.isPhoneVerified) return res.status(400).json({ msg: 'Please verify your phone number first.' });
        if (user.emailOtp !== otp || user.emailOtpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired email OTP.' });
        }

        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        const sessionDetails = getSessionDetails(req);
        const newSession = {
            ...sessionDetails,
            token: token,
        };

        user.activeSession = newSession;
        user.sessions.push(newSession);
        await user.save();

        // --- FIX: This is the crucial part ---
        // Send the token back to the client after successful verification.
        res.json({
            msg: 'Email verified successfully. Proceed to payment.',
            token: token
        });

   } catch (err) {
        console.error('Signup Email Verification Error:', err);
        res.status(500).send('Server error');
    }
};
exports.resendSignupEmailOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found.' });
        if (!user.isPhoneVerified) return res.status(400).json({ msg: 'Phone not verified yet.' });

        await generateAndSendEmailOtp(user, email);
        await user.save(); // Save the new OTP

        res.status(200).json({ msg: 'A new OTP has been sent to your email.' });
    } catch (err) {
        console.error('Resend Signup Email OTP Error:', err);
        res.status(500).json({ msg: 'Failed to resend OTP.' });
    }
};



// --- *** NEW FUNCTIONS TO CHANGE CONTACT INFO DURING SIGNUP *** ---

exports.changeSignupPhone = async (req, res) => {
    const { oldPhoneNumber, newPhoneNumber, email } = req.body;
    try {
        const existingUser = await User.findOne({ phoneNumber: newPhoneNumber, isPhoneVerified: true });
        if (existingUser) {
            return res.status(400).json({ msg: 'This phone number is already registered.' });
        }
        const user = await User.findOne({ $or: [{ email }, { phoneNumber: oldPhoneNumber }] });
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        user.phoneNumber = newPhoneNumber;
        await user.save();

        // **FIXED**: Now uses Twilio
        const otpResult = await sendPhoneOtpWithTwilio(newPhoneNumber);

        if (!otpResult.success) {
            return res.status(500).json({ msg: 'Failed to update phone number and send OTP.' });
        }
        res.status(200).json({ msg: 'OTP sent to new phone number.' });
    } catch (err) {
        console.error('Change Signup Phone Error:', err);
        res.status(500).json({ msg: 'Failed to update phone number.' });
    }
};


exports.changeSignupEmail = async (req, res) => {
    const { oldEmail, newEmail } = req.body;
    try {
        const existingUser = await User.findOne({ email: newEmail, isEmailVerified: true });
        if (existingUser) {
            return res.status(400).json({ msg: 'This email is already registered.' });
        }
        const user = await User.findOne({ email: oldEmail });
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        user.email = newEmail;
        await generateAndSendEmailOtp(user, newEmail);
        await user.save();
        res.status(200).json({ msg: 'OTP sent to new email address.' });
    } catch (err) {
        console.error('Change Signup Email Error:', err);
        res.status(500).json({ msg: 'Failed to update email.' });
    }
};


exports.verifyPhoneOtp = async (req, res) => {
    const { otp } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.pendingNewPhone) {
            return res.status(400).json({ msg: 'No phone number update pending for this user.' });
        }

        if (user.phoneOtp === otp && user.phoneOtpExpires > Date.now()) {
            user.phoneNumber = user.pendingNewPhone;
            user.isPhoneVerified = true;
            user.pendingNewPhone = undefined;
            user.phoneOtp = undefined;
            user.phoneOtpExpires = undefined;
            await user.save();
            res.json({ msg: 'Phone number updated successfully.' });
        } else {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }
    } catch (err) {
        console.error('Error in verifyPhoneOtp:', err);
        res.status(500).send('Server error');
    }
};

exports.verifyEmailOtp = async (req, res) => {
    const { email: newEmail, otp } = req.body;
    console.log('\n--- [VERIFY EMAIL] Step 2: Request Received ---');
    console.log(`Attempting to verify OTP ${otp} for new email ${newEmail}`);

    try {
        // Find the currently authenticated user
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('[FAILURE] Authenticated user not found.');
            return res.status(404).json({ msg: 'User not found.' });
        }
        console.log(`Found authenticated user: ${user.email}`);
        console.log(`  - DB OTP: ${user.emailOtp}`);
        console.log(`  - DB OTP Expires: ${new Date(user.emailOtpExpires)}`);
        console.log(`  - DB Pending Email: ${user.pendingNewEmail}`);

        // Securely check all conditions
        if (user.pendingNewEmail !== newEmail || user.emailOtp !== otp || user.emailOtpExpires < Date.now()) {
            console.log('[FAILURE] OTP check failed. Conditions:');
            console.log(`  - Pending email matches: ${user.pendingNewEmail === newEmail}`);
            console.log(`  - OTP matches: ${user.emailOtp === otp}`);
            console.log(`  - Not expired: ${user.emailOtpExpires > Date.now()}`);
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        // All checks passed. Finalize the update.
        console.log('[SUCCESS] OTP is valid. Updating user email...');
        user.email = user.pendingNewEmail;
        user.pendingNewEmail = undefined;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;

        await user.save();
        console.log(`[SUCCESS] User email updated to ${user.email}`);

        res.json({ msg: 'Email updated successfully.' });

    } catch (err) {
        console.error('[ERROR] in verifyEmailOtp:', err);
        res.status(500).send('Server error');
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (!user.isEmailVerified) {
            return res.status(401).json({
                msg: 'Please verify your email to login.',
                verificationRequired: 'email'
            });
        }

        if (!user.isPhoneVerified) {
            return res.status(401).json({
                msg: 'Please verify your phone to login.',
                verificationRequired: 'phone'
            });
        }

         if (user.activeSession && user.activeSession.token) {
            try {
                // Verify the token to ensure the session is still valid
                jwt.verify(user.activeSession.token, process.env.JWT_SECRET);
                // If the token is valid, an active session exists.
                return res.status(409).json({
                    msgKey: 'errors.session_conflict',
                    activeSession: user.activeSession
                });
            } catch (error) {
                // If the token is invalid (e.g., expired), proceed with login
                // as the old session is no longer valid.
            }
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        const sessionDetails = getSessionDetails(req);
        const newSession = {
            ...sessionDetails,
            token: token,
        };

        // --- FIX STARTS HERE ---

        // 1. Set the user's active session to the new session
        user.activeSession = newSession;

        // 2. Push the new session to the session history array
        user.sessions.push(newSession);

        // --- FIX ENDS HERE ---

        await user.save();

        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyEmail = async (req, res) => {
    const { otp } = req.body;

    try {
        // 1. Find the currently authenticated user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // 2. Check if a new email change is pending and if OTP is valid
        if (!user.pendingNewEmail) {
             return res.status(400).json({ msg: 'No email update pending.' });
        }

        if (user.emailOtp !== otp || user.emailOtpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        // 3. Update the email and clear temporary fields
        user.email = user.pendingNewEmail;
        user.pendingNewEmail = undefined;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;

        await user.save();

        res.json({ msg: 'Email updated successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// **MISSING FUNCTION:** This is the function that your routes file is looking for.
exports.forceLoginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msgKey: 'errors.invalid_credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msgKey: 'errors.invalid_credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        user.activeSession = { token, ...getSessionDetails(req) };
        await user.save();

        res.json({ token });
    } catch (err) {
        console.error('Force Login Error:', err.message);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'User not authenticated for logout.' });
        }
        const user = await User.findById(req.user.id);
        if (user) {
            user.activeSession = undefined;
            await user.save();
        }
        res.status(200).json({ msg: 'Logged out successfully.' });
    } catch (err) {
        console.error('Logout Error:', err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

exports.checkEmailExists = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        res.json({ exists: !!user });
    } catch (err) {
        console.error('Error checking email existence:', err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

exports.checkPhoneExists = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const user = await User.findOne({ phoneNumber });
        res.json({ exists: !!user });
    } catch (err) {
        console.error('Error checking phone existence:', err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

exports.resendPhoneOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msgKey: 'errors.user_not_found' });

        // **FIXED**: Now uses Twilio
        const otpResult = await sendPhoneOtpWithTwilio(user.phoneNumber);

        if (!otpResult.success) {
            return res.status(500).json({ msgKey: 'errors.otp_failed_resend' });
        }
        res.status(200).json({ msg: 'phone_otp_resent_success' });
    } catch (err) {
        console.error('Resend Phone OTP Error:', err);
        res.status(500).json({ msgKey: 'errors.otp_failed_resend' });
    }
};

exports.updateAndResendPhoneOtp = async (req, res) => {
    const { newPhoneNumber } = req.body;
    try {
        const existingUser = await User.findOne({ phoneNumber: newPhoneNumber });
        if (existingUser) {
            return res.status(400).json({ msg: 'Phone number is already registered.' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        user.pendingNewPhone = newPhoneNumber;
        await user.save();

        // **FIXED**: Now uses Twilio
        const otpResult = await sendPhoneOtpWithTwilio(newPhoneNumber);

        if (!otpResult.success) {
            return res.status(500).json({ msg: 'Failed to send OTP to the new phone number.' });
        }
        res.json({ msg: `OTP sent to ${newPhoneNumber}` });
    } catch (err) {
        console.error('Error in updateAndResendPhoneOtp:', err);
        res.status(500).send('Server error');
    }
};


exports.resendEmailOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msgKey: 'errors.user_not_found' });

        await generateAndSendEmailOtp(user, email);
        res.status(200).json({ msg: 'email_otp_resent_success' });
    } catch (err) {
        console.error('Resend Email OTP Error:', err);
        res.status(500).json({ msgKey: 'errors.otp_failed_resend' });
    }
};

exports.updateAndResendEmailOtp = async (req, res) => {
    const { newEmail } = req.body;
    console.log('\n--- [UPDATE EMAIL] Step 1: Request Received ---');
    console.log(`Attempting to change email to: ${newEmail}`);

    try {
        // Check if the new email is already in use by another account
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            console.log(`[FAILURE] Email ${newEmail} already exists.`);
            return res.status(400).json({ msg: 'Email is already registered. Please use a different email id.' });
        }
        console.log(`[SUCCESS] Email ${newEmail} is available.`);

        // Find the currently authenticated user
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('[FAILURE] Authenticated user not found.');
            return res.status(404).json({ msg: 'User not found.' });
        }
        console.log(`Found authenticated user: ${user.email}`);

        // Store the new email and OTP on the user's document
        user.pendingNewEmail = newEmail;
        await generateAndSendEmailOtp(user, newEmail); // Pass user document and target email

        console.log(`Saving OTP and pending email for user ${user.email}...`);
        await user.save();
        console.log('[SUCCESS] OTP saved and email sent.');

        res.json({ msg: `OTP sent to ${newEmail}` });

    } catch (err) {
        console.error('[ERROR] in updateAndResendEmailOtp:', err);
        res.status(500).send('Server error');
    }
};
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msgKey: 'errors.email_not_registered' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

       const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.SMTP_USER,
            subject: 'SeekMYCOURSE Password Reset',
            html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
            <a href="${resetUrl}">${resetUrl}</a>\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'reset_link_sent' });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msgKey: 'errors.password_reset_invalid' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ msg: 'password_updated_success' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

// --- NEW FUNCTION: Fetch User Stats for Profile Header ---
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const generatedCoursesCount = await Course.countDocuments({ createdBy: userId });
        const completedCoursesCount = await Course.countDocuments({ createdBy: userId, status: 'Completed' });

        // Use dummy data for pre-generated courses as per requirements
        const preGeneratedAccessed = 5;
        const preGeneratedCompleted = 2;

        res.status(200).json({
            coursesGenerated: generatedCoursesCount,
            coursesCompleted: completedCoursesCount,
            preGeneratedAccessed: preGeneratedAccessed,
            preGeneratedCompleted: preGeneratedCompleted,
        });
    } catch (err) {
        console.error("Error fetching user stats:", err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

// --- NEW FUNCTION: Fetch User Profile Data ---
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msgKey: 'errors.user_not_found' });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

// --- NEW FUNCTION: Update Personal Info & Billing Address ---
exports.updatePersonalInfo = async (req, res) => {
    try {
        const { firstName, lastName, phone, billingAddress } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msgKey: 'errors.user_not_found' });
        }

        // Update fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phoneNumber = phone;
        if (billingAddress) user.billingAddress = billingAddress;

        await user.save();
        res.json({ msg: 'Personal info updated successfully', user });
    } catch (err) {
        console.error("Error updating personal info:", err);
        res.status(500).json({ msgKey: 'errors.profile_update_failed' });
    }
};

// --- NEW FUNCTION: Update Bio and Social Media ---
exports.updateBio = async (req, res) => {
    try {
        const { bio, socialMedia } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msgKey: 'errors.user_not_found' });
        }

        user.bio = bio;
        user.socialMedia = socialMedia;

        await user.save();
        res.json({ msg: 'Bio and social media updated successfully', user });
    } catch (err) {
        console.error("Error updating bio:", err);
        res.status(500).json({ msgKey: 'errors.profile_update_failed' });
    }
};

// --- NEW FUNCTION: Update LEARNS Profile ---
exports.updateLearnsProfile = async (req, res) => {
    try {
        const { learningGoals, experienceLevel, areasOfInterest, resourceNeeds, newSkillTarget } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.learningGoals = learningGoals;
        user.experienceLevel = experienceLevel;
        user.areasOfInterest = areasOfInterest;
        user.resourceNeeds = resourceNeeds;
        user.newSkillTarget = newSkillTarget;

        await user.save();
        res.json({ msg: 'LEARNS profile updated successfully', user });
    } catch (err) {
        console.error("Error updating LEARNS profile:", err);
        res.status(500).json({ msgKey: 'errors.profile_update_failed' });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        user.profilePicture = fileUrl;
        await user.save();

        res.status(200).json({
            msg: 'Profile picture updated successfully',
            profilePicture: user.profilePicture
        });
    } catch (err) {
        console.error('Error uploading profile picture:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
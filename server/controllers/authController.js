// server/controllers/authController.js
const User = require('../models/User');
const Course = require('../models/Course');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const useragent = require('useragent');
const geoip = require('geoip-lite');
const path = require('path');
const fs = require('fs');

const getSessionDetails = (req) => {
    const agent = useragent.parse(req.headers['user-agent']);
    const ip = req.ip === '::1' ? '127.0.0.1' : (req.ip || req.connection.remoteAddress);
    const geo = geoip.lookup(ip);
    const location = (ip === '127.0.0.1') ? 'Localhost' : (geo ? `${geo.city}, ${geo.region}, ${geo.country}` : 'Unknown Location');
    return { ipAddress: ip, device: `${agent.toAgent()} on ${agent.os.toString()}`, location };
};

// NEW HELPER FUNCTION: To generate and send email OTP
const generateAndSendEmailOtp = async (user, targetEmail) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: targetEmail, // Use the target email address
        subject: 'Your OTP for SeekMyCourse',
        text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    // The save will be handled by the calling function
};


exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    try {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) return res.status(400).json({ msgKey: 'errors.email_exists' });
        
        let userByPhone = await User.findOne({ phoneNumber });
        if (userByPhone) return res.status(400).json({ msgKey: 'errors.phone_exists' });

        const user = new User({ firstName, lastName, email, password, phoneNumber });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({ to: phoneNumber, channel: 'sms' });
        
        res.status(201).json({ msg: 'Registration successful. Please verify your phone number.', email: user.email, phone: user.phoneNumber });
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.code === 21614) { // Twilio error code for invalid phone number
            return res.status(400).json({ msgKey: 'errors.phone_invalid', context: { phoneNumber: err.message.match(/\+?\d{10,15}/)?.[0] || 'provided number' } });
        } else if (err.code === 21612) { // Twilio error code for fraudulent phone number
            const fraudulentPhoneNumber = err.message.match(/\+?\d{10,15}/)?.[0];
            return res.status(400).json({ msgKey: 'errors.phone_fraudulent', context: { phoneNumber: fraudulentPhoneNumber } });
        }
        res.status(500).json({ msgKey: 'errors.generic' });
    }
};

exports.verifyPhoneOtp = async (req, res) => {
    const { otp } = req.body;
    console.log('\n--- [VERIFY PHONE] Step 2: Request Received ---');
    console.log(`Attempting to verify OTP ${otp}`);

    try {
        // 1. Find the currently authenticated user
        const user = await User.findById(req.user.id);
        if (!user || !user.pendingNewPhone) {
            console.log('[FAILURE] User not found or no phone update pending.');
            return res.status(400).json({ msg: 'No phone number update pending for this user.' });
        }
        console.log(`Found user: ${user.email}, verifying for phone: ${user.pendingNewPhone}`);

        // 2. Check the OTP with Twilio
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
            .verificationChecks.create({ to: user.pendingNewPhone, code: otp });

        // 3. If OTP is valid, finalize the update
        if (check.status === 'approved') {
            console.log('[SUCCESS] OTP is valid. Updating user phone number...');
            user.phoneNumber = user.pendingNewPhone;
            user.isPhoneVerified = true;
            user.pendingNewPhone = undefined; // Clear the temporary field
            await user.save();
            
            console.log(`[SUCCESS] User phone updated to ${user.phoneNumber}`);
            res.json({ msg: 'Phone number updated successfully.' });
        } else {
            console.log(`[FAILURE] Invalid OTP. Twilio status: ${check.status}`);
            return res.status(400).json({ msg: 'Invalid OTP.' });
        }
    } catch (err) {
        console.error('[ERROR] in verifyPhoneOtp:', err);
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
        if (!user) return res.status(400).json({ msgKey: 'errors.invalid_credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msgKey: 'errors.invalid_credentials' });

        if (user.activeSession) {
            try {
                jwt.verify(user.activeSession.token, process.env.JWT_SECRET);
                return res.status(409).json({
                    msgKey: 'errors.session_conflict',
                    activeSession: user.activeSession
                });
            } catch (jwtError) {
                user.activeSession = undefined;
                await user.save();
                console.log('[Login] Expired/Invalid session token found and cleared.');
            }
        }

       const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    user.activeSession = { token, ...getSessionDetails(req) };

    await user.save(); 
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msgKey: 'errors.generic' });
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

        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({ to: user.phoneNumber, channel: 'sms' });

        res.status(200).json({ msg: 'phone_otp_resent_success' });
    } catch (err) {
        console.error('Resend Phone OTP Error:', err);
        if (err.code === 21614) {
            return res.status(400).json({ msgKey: 'errors.phone_invalid', context: { phoneNumber: err.message.match(/\+?\d{10,15}/)?.[0] || 'provided number' } });
        } else if (err.code === 21612) {
            const fraudulentPhoneNumber = err.message.match(/\+?\d{10,15}/)?.[0];
            return res.status(400).json({ msgKey: 'errors.phone_fraudulent', context: { phoneNumber: fraudulentPhoneNumber } });
        }
        res.status(500).json({ msgKey: 'errors.otp_failed_resend' });
    }
};

exports.updateAndResendPhoneOtp = async (req, res) => {
    const { newPhoneNumber } = req.body;
    console.log('\n--- [UPDATE PHONE] Step 1: Request Received ---');
    console.log(`Attempting to change phone to: ${newPhoneNumber}`);

    try {
        const existingUser = await User.findOne({ phoneNumber: newPhoneNumber });
        if (existingUser) {
            console.log(`[FAILURE] Phone number ${newPhoneNumber} already exists.`);
            return res.status(400).json({ msg: 'Phone number is already registered.' });
        }
        console.log(`[SUCCESS] Phone number ${newPhoneNumber} is available.`);

        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('[FAILURE] Authenticated user not found.');
            return res.status(404).json({ msg: 'User not found.' });
        }

        user.pendingNewPhone = newPhoneNumber;
        await user.save();
        console.log(`Pending phone saved for user ${user.email}.`);

        // --- DEBUGGING LOGS ADDED HERE ---
        console.log('\n--- [TWILIO DEBUG] Checking Credentials ---');
        console.log(`TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID}`);
        console.log(`TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? 'Loaded' : '!!! NOT LOADED !!!'}`);
        console.log(`TWILIO_VERIFY_SID: ${process.env.TWILIO_VERIFY_SID}`);
        console.log('------------------------------------------\n');
        // --- END OF DEBUGGING LOGS ---

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.verify.v2.services(process.env.TWILIO_VERIFY_SID)
            .verifications.create({ to: newPhoneNumber, channel: 'sms' });

        console.log(`[SUCCESS] Twilio OTP sent to ${newPhoneNumber}.`);
        res.json({ msg: `OTP sent to ${newPhoneNumber}` });

    } catch (err) {
        console.error('[ERROR] in updateAndResendPhoneOtp:', err);
        res.status(500).send('Server error');
    }
};
exports.resendEmailOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msgKey: 'errors.user_not_found' });

        await generateAndSendEmailOtp(user);
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

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

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
            return res.status(404).json({ msgKey: 'errors.user_not_found' });
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

// --- NEW FUNCTION: Upload Profile Picture ---
exports.uploadProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Assuming file is uploaded and available via req.file (e.g., using multer)
        // For now, this is a placeholder. A proper file upload setup (like Multer and an S3 bucket) is required.
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        
        // This is a placeholder. In a real-world scenario, you'd upload the file
        // to a service like AWS S3 or Cloudinary and save the public URL.
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        user.profilePicture = fileUrl;
        await user.save();

        res.status(200).json({ msg: 'Profile picture updated successfully', profilePictureUrl: fileUrl });
    } catch (err) {
        console.error("Error uploading profile picture:", err);
        res.status(500).json({ msg: 'Server Error' });
    }
};
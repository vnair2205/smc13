// server/controllers/profileController.js
const User = require('../models/User');
// --- 1. IMPORT AXIOS FOR API CALLS ---
const axios = require('axios');

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -phoneOtp -phoneOtpExpires');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update personal information
const updatePersonalInfo = async (req, res) => {
    // ... (This function remains the same)
    const { firstName, lastName, billingAddress } = req.body;
    const personalFields = { firstName, lastName, billingAddress };
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: personalFields },
            { new: true }
        ).select('-password');
        res.json({ msg: "Personal info updated successfully", user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update LEARNS profile
const updateLearnsProfile = async (req, res) => {
    // ... (This function remains the same)
    const { learningGoals, experienceLevel, areasOfInterest, resourceNeeds, newSkillTarget } = req.body;
    const learnsFields = { learningGoals, experienceLevel, areasOfInterest, resourceNeeds, newSkillTarget };
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: learnsFields },
            { new: true }
        ).select('-password');
        res.json({ msg: "LEARNS profile updated successfully", user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update profile picture URL
const updateProfilePicture = async (req, res) => {
    // ... (This function remains the same)
    const { imageUrl } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profilePicture: imageUrl } },
            { new: true }
        ).select('-password');
        res.json({ msg: "Profile picture updated", user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// --- 2. NEW FUNCTION: Update Phone Number (Sends OTP) ---
const updatePhoneNumber = async (req, res) => {
    const { newPhoneNumber } = req.body;
    try {
        // Check if the new phone number is already in use by a verified user
        const existingUser = await User.findOne({ phoneNumber: newPhoneNumber, isPhoneVerified: true });
        if (existingUser) {
            return res.status(400).json({ msg: 'This phone number is already registered.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Send OTP using 2Factor
        const apiKey = process.env.TWOFACTOR_API_KEY;
        const numericPhone = newPhoneNumber.replace(/\D/g, '');
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/${numericPhone}/AUTOGEN`;

        const response = await axios.get(url);

        if (response.data.Status === 'Success') {
            user.pendingNewPhone = newPhoneNumber; // Store the number to be verified
            user.phoneOtpSessionId = response.data.Details; // Store the session ID from 2Factor
            await user.save();
            res.json({ msg: 'OTP sent to new phone number for verification.' });
        } else {
            console.error("2Factor API Error:", response.data.Details);
            res.status(500).json({ msg: 'Failed to send OTP.' });
        }
    } catch (error) {
        console.error('Update Phone Number Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Server Error');
    }
};

// --- 3. NEW FUNCTION: Verify Phone Number Update (Checks OTP) ---
const verifyUpdatePhoneNumber = async (req, res) => {
    const { otp } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.pendingNewPhone || !user.phoneOtpSessionId) {
            return res.status(400).json({ msg: 'No pending phone number update found for this user.' });
        }

        // Verify OTP with 2Factor
        const apiKey = process.env.TWOFACTOR_API_KEY;
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${user.phoneOtpSessionId}/${otp}`;

        const response = await axios.get(url);

        if (response.data.Status === 'Success') {
            // If OTP is correct, finalize the update
            user.phoneNumber = user.pendingNewPhone;
            user.isPhoneVerified = true;
            user.pendingNewPhone = undefined;
            user.phoneOtpSessionId = undefined; // Clear the session ID
            await user.save();
            res.json({ msg: 'Phone number updated successfully.', user });
        } else {
            // If OTP is incorrect
            res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Verify Phone Update Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Server Error');
    }
};


module.exports = {
    getProfile,
    updatePersonalInfo,
    updateLearnsProfile,
    updateProfilePicture,
    // --- 4. EXPORT THE NEW FUNCTIONS ---
    updatePhoneNumber,
    verifyUpdatePhoneNumber
};
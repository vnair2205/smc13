// server/controllers/profileController.js
const User = require('../models/User');
const axios = require('axios');
const bcrypt = require('bcryptjs');

// ** CHANGE THIS LINE **
// Define as a constant like the other functions
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ msg: 'Password updated successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

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

const updatePersonalInfo = async (req, res) => {
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

const updateLearnsProfile = async (req, res) => {
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

const updateProfilePicture = async (req, res) => {
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

const updatePhoneNumber = async (req, res) => {
    const { newPhoneNumber } = req.body;
    try {
        const existingUser = await User.findOne({ phoneNumber: newPhoneNumber, isPhoneVerified: true });
        if (existingUser) {
            return res.status(400).json({ msg: 'This phone number is already registered.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const apiKey = process.env.TWOFACTOR_API_KEY;
        const numericPhone = newPhoneNumber.replace(/\D/g, '');
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/${numericPhone}/AUTOGEN`;

        const response = await axios.get(url);

        if (response.data.Status === 'Success') {
            user.pendingNewPhone = newPhoneNumber;
            user.phoneOtpSessionId = response.data.Details;
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

const verifyUpdatePhoneNumber = async (req, res) => {
    const { otp } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.pendingNewPhone || !user.phoneOtpSessionId) {
            return res.status(400).json({ msg: 'No pending phone number update found for this user.' });
        }

        const apiKey = process.env.TWOFACTOR_API_KEY;
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${user.phoneOtpSessionId}/${otp}`;

        const response = await axios.get(url);

        if (response.data.Status === 'Success') {
            user.phoneNumber = user.pendingNewPhone;
            user.isPhoneVerified = true;
            user.pendingNewPhone = undefined;
            user.phoneOtpSessionId = undefined;
            await user.save();
            res.json({ msg: 'Phone number updated successfully.', user });
        } else {
            res.status(400).json({ msg: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Verify Phone Update Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Server Error');
    }
};

const getProfileForAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

const updateProfileForAdmin = async (req, res) => {
  const { firstName, lastName, bio, interests, linkedIn, twitter, website } = req.body;
  const profileFields = { firstName, lastName, bio, interests, professionalDetails: { linkedIn, twitter, website } };

  try {
    let user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


// ** ADD changePassword TO THIS OBJECT **
module.exports = {
    getProfile,
    updatePersonalInfo,
    updateLearnsProfile,
    updateProfilePicture,
    changePassword,
    updatePhoneNumber,
    verifyUpdatePhoneNumber,
    getProfileForAdmin, 
    updateProfileForAdmin 
};


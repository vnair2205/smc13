// server/controllers/profileController.js
const User = require('../models/User');

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
    const { firstName, lastName, billingAddress } = req.body;

    const personalFields = {
        firstName,
        lastName,
        billingAddress,
    };

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
    const {
        learningGoals,
        experienceLevel,
        areasOfInterest,
        resourceNeeds,
        newSkillTarget
    } = req.body;

    const learnsFields = {
        learningGoals,
        experienceLevel,
        areasOfInterest,
        resourceNeeds,
        newSkillTarget
    };

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


module.exports = {
    getProfile,
    updatePersonalInfo,
    updateLearnsProfile,
    updateProfilePicture
};
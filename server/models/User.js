// server/models/User.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    token: { type: String, required: true },
    ipAddress: { type: String },
    device: { type: String },
    location: { type: String },
    loggedInAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    phoneOtp: { type: String },
    phoneOtpExpires: { type: Date },
    date: { type: Date, default: Date.now },
    isEmailVerified: { type: Boolean, default: false },

    // --- NEW FIELDS FOR EMAIL UPDATE PROCESS ---
    emailOtp: { type: String },
    emailOtpExpires: { type: Date },
    pendingNewEmail: { type: String }, // To temporarily hold the new email during verification


      pendingNewPhone: { type: String },

    // --- Profile Fields ---
    profilePicture: { 
        type: String, 
        default: 'https://i.imgur.com/6b6psnA.png'
    },


    billingAddress: {
        addressLine1: { type: String, default: '' },
        addressLine2: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: '' },
    },
    
    // BIO Section
    bio: { type: String, default: '' },
    socialMedia: {
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        x: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        facebook: { type: String, default: '' },
    },

    // LEARNS Profile Section
    learningGoals: { type: [String], default: [] },
    experienceLevel: { type: String, default: 'Beginner' },
    areasOfInterest: { type: [String], default: [] },
    resourceNeeds: { type: [String], default: [] },
    newSkillTarget: { type: [String], default: [] },

    // Session Management
    activeSession: SessionSchema, 
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('User', UserSchema);
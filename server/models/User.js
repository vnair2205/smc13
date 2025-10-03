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
    // --- 1. ADD THIS NEW FIELD ---
    phoneOtpSessionId: { type: String }, // To store the session ID from 2Factor
    
    date: { type: Date, default: Date.now },
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    emailOtpExpires: { type: Date },
    pendingNewEmail: { type: String },
    pendingNewPhone: { type: String },
    profilePicture: {
        type: String,
        default: 'https://i.imgur.com/6b6psnA.png'
    },
    selectedPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
    },
    activeSubscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending_payment', 'unverified'],
        default: 'pending_payment',
    },
    coursesRemaining: {
        type: Number,
        default: 0
    },

      referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlanReferrer',
        default: null,
    },
    billingAddress: {
        addressLine1: { type: String, default: '' },
        addressLine2: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: '' },
    },
    bio: { type: String, default: '' },
    socialMedia: {
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        x: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        facebook: { type: String, default: '' },
    },
    learningGoals: { type: [String], default: [] },
    experienceLevel: { type: String, default: 'Beginner' },
    areasOfInterest: { type: [String], default: [] },
    resourceNeeds: { type: [String], default: [] },
    newSkillTarget: { 
        type: [String], 
        default: [] 
    },
    sessions: [SessionSchema],
    activeSession: SessionSchema,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });


UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
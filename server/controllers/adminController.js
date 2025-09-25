// server/controllers/adminController.js
const Admin = require('../models/Admin');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');


// Admin Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const payload = { admin: { id: admin.id } };
    jwt.sign(
      payload,
      process.env.JWT_ADMIN_SECRET, // Use a separate secret for admins
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ msg: 'Admin not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await admin.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/admin/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"SeekMYCOURSE" <${process.env.SMTP_USER}>`,
            to: admin.email,
            subject: 'Password Reset Request',
            html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                   <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                   <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
        });

        res.status(200).json({ msg: 'Email sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const admin = await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(req.body.password, salt);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.status(200).json({ msg: 'Password has been reset' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add a new team member
exports.addTeamMember = async (req, res) => {
  const { firstName, lastName, email, password, designation, department } = req.body;
  try {
    let member = await Admin.findOne({ email });
    if (member) {
      return res.status(400).json({ msg: 'Team member already exists' });
    }

    member = new Admin({
      firstName,
      lastName,
      email,
      password,
      designation,
      department,
      profilePicture: req.file ? req.file.path : undefined,
    });

    const salt = await bcrypt.genSalt(10);
    member.password = await bcrypt.hash(password, salt);
    await member.save();
    res.json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all team members
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await Admin.find().populate('designation').populate('department');
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a team member
exports.updateTeamMember = async (req, res) => {
  const { firstName, lastName, email, designation, department } = req.body;
  const { id } = req.params;

  const memberFields = { firstName, lastName, email, designation, department };
  if (req.file) {
    memberFields.profilePicture = req.file.path;
  }

  try {
    let member = await Admin.findById(id);
    if (!member) {
      return res.status(404).json({ msg: 'Team member not found' });
    }

    member = await Admin.findByIdAndUpdate(id, { $set: memberFields }, { new: true });
    res.json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a team member
exports.deleteTeamMember = async (req, res) => {
  try {
    let member = await Admin.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ msg: 'Team member not found' });
    }
    await Admin.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Team member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// --- NEW USER MANAGEMENT FUNCTIONS ---

// Get User Statistics
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const inactiveUsers = totalUsers - activeUsers;

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Users with Pagination, Search, and Filter
exports.getUsers = async (req, res) => {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    try {
        const query = {};
        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }

        const users = await User.find(query)
            .populate({
                path: 'activeSubscription',
                populate: {
                    path: 'plan',
                    model: 'SubscriptionPlan'
                }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Single User Details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const subscriptionHistory = await Subscription.find({ user: req.params.id })
            .populate('plan')
            .sort({ startDate: -1 });
        
        const activeSubscription = await Subscription.findOne({ user: req.params.id, status: 'active' })
            .populate('plan');

        res.json({ user, subscriptionHistory, activeSubscription });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin Changes User Subscription Plan
exports.changeUserPlan = async (req, res) => {
    const { userId, newPlanId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        const newPlan = await SubscriptionPlan.findById(newPlanId);
        if (!newPlan) {
            return res.status(404).json({ msg: 'Subscription plan not found' });
        }

        // Deactivate current active subscription
        await Subscription.updateMany(
            { user: userId, status: 'active' },
            { $set: { status: 'cancelled', endDate: new Date() } }
        );

        // Create a new subscription
        const today = new Date();
        const endDate = new Date(today.setMonth(today.getMonth() + 1));

        const newSubscription = new Subscription({
            user: userId,
            plan: newPlanId,
            razorpay_payment_id: `admin_changed_${Date.now()}`,
            razorpay_order_id: `admin_changed_${Date.now()}`,
            razorpay_signature: 'admin_changed',
            startDate: new Date(),
            endDate: endDate,
            status: 'active',
        });
        
        await newSubscription.save();
        
        // Update user's active subscription and course quota
        user.activeSubscription = newSubscription._id;
        user.coursesRemaining = newPlan.coursesPerMonth;
        user.status = 'active';
        await user.save();

        res.json({ msg: "User's plan has been successfully changed.", user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Manually Add Course Count for a User
exports.addCourseCount = async (req, res) => {
    const { userId, additionalCourses } = req.body;
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.coursesRemaining += Number(additionalCourses);
        await user.save();

        res.json({ msg: `${additionalCourses} courses added to the user's quota.`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// server/controllers/adminController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            to: admin.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your admin account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `${resetUrl}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'An email has been sent with further instructions.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
        }

        admin.password = req.body.password; // The pre-save hook will hash it
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;

        await admin.save();

        res.status(200).json({ msg: 'Password has been reset.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add a new team member
exports.addTeamMember = async (req, res) => {
  const { firstName, lastName, email, password, designation, department } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: 'Team member already exists' });
    }

    admin = new Admin({
      firstName,
      lastName,
      email,
      password,
      designation,
      department,
    });

    if (req.file) {
      admin.profilePicture = req.file.path;
    }

    await admin.save();
    res.status(201).json(admin);
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
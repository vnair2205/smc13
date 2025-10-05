const bcrypt = require('bcryptjs');
const Institute = require('../models/Institute');
const InstituteAdmin = require('../models/InstituteAdmin'); // --- FIX: Import InstituteAdmin
const InstitutePlan = require('../models/institutePlan');

// @route   POST api/institutes
// @desc    Create a new institute and its admin user
// @access  Private (Admin)
exports.createInstitute = async (req, res) => {
    const {
        instituteName, addressLine1, addressLine2, city, state, pinCode,
        institutePhoneNumber, instituteEmail, adminFirstName, adminLastName,
        adminEmail, adminPassword, adminPhoneNumber, planId
    } = req.body;

    try {
        // Check if admin email already exists in the InstituteAdmin collection
        let adminUser = await InstituteAdmin.findOne({ email: adminEmail });
        if (adminUser) {
            return res.status(400).json({ msg: 'An institute admin with this email already exists.' });
        }

        // Hash admin password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create the new admin user
        adminUser = new InstituteAdmin({
            firstName: adminFirstName,
            lastName: adminLastName,
            email: adminEmail,
            password: hashedPassword,
            phoneNumber: adminPhoneNumber,
        });
        await adminUser.save();

        // Create the new institute
        const newInstitute = new Institute({
            instituteName,
            address: { line1: addressLine1, line2: addressLine2, city, state, pinCode },
            institutePhoneNumber,
            instituteEmail,
            admin: adminUser._id,
            plan: planId,
        });
        await newInstitute.save();

        // Link the institute back to the admin user
        adminUser.institute = newInstitute._id;
        await adminUser.save();

        res.status(201).json(newInstitute);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/institutes
// @desc    Get all institutional users with pagination, search, and filter
// @access  Private (Admin)
exports.getInstitutes = async (req, res) => {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    const query = {};
    if (search) {
        query.instituteName = { $regex: search, $options: 'i' };
    }
    if (status) {
        query.status = status;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [
            // --- FIX: Populate from 'InstituteAdmin' model
            { path: 'admin', model: 'InstituteAdmin', select: 'firstName lastName email phoneNumber' },
            { path: 'plan', select: 'name' }
        ],
        sort: { createdAt: -1 }
    };

    try {
        const institutes = await Institute.paginate(query, options);
        res.json(institutes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/institutes/stats
// @desc    Get stats for institutional users
// @access  Private (Admin)
exports.getInstituteStats = async (req, res) => {
    try {
        const total = await Institute.countDocuments();
        const active = await Institute.countDocuments({ status: 'active' });
        const inactive = await Institute.countDocuments({ status: 'inactive' });
        res.json({ total, active, inactive });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
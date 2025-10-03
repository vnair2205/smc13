// server/controllers/planReferrerController.js
const PlanReferrer = require('../models/PlanReferrer');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a new plan referrer
// @route   POST /api/referrers
exports.createReferrer = async (req, res) => {
    const { firstName, lastName, email, phone, password, planId } = req.body;
    try {
        let referrer = await PlanReferrer.findOne({ email });
        if (referrer) {
            return res.status(400).json({ message: 'A referrer with this email already exists.' });
        }

        referrer = new PlanReferrer({
            firstName,
            lastName,
            email,
            phone,
            password,
            plan: planId,
        });

        await referrer.save();
        res.status(201).json(referrer);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all plan referrers
// @route   GET /api/referrers
exports.getReferrers = async (req, res) => {
    try {
        const referrers = await PlanReferrer.find().populate('plan', 'name');

        // Calculate user count for each referrer
        const referrersWithUserCount = await Promise.all(
            referrers.map(async (referrer) => {
                const userCount = await User.countDocuments({ referrer: referrer._id });
                return {
                    ...referrer.toObject(),
                    userCount,
                };
            })
        );
        
        res.json(referrersWithUserCount);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a plan referrer
// @route   PUT /api/referrers/:id
exports.updateReferrer = async (req, res) => {
    const { firstName, lastName, email, phone, password, planId } = req.body;
    try {
        let referrer = await PlanReferrer.findById(req.params.id);
        if (!referrer) {
            return res.status(404).json({ message: 'Referrer not found' });
        }

        // Build referrer object
        const referrerFields = {
            firstName,
            lastName,
            email,
            phone,
            plan: planId,
        };

        // If a new password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            referrerFields.password = await bcrypt.hash(password, salt);
        }

        referrer = await PlanReferrer.findByIdAndUpdate(
            req.params.id,
            { $set: referrerFields },
            { new: true }
        );

        res.json(referrer);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};
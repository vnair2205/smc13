const InstitutePlan = require('../models/institutePlan');

// @route   POST api/institute-plans
// @desc    Create a new institutional plan
// @access  Private (Admin)
exports.createPlan = async (req, res) => {
    try {
        const { name, duration, adminCoursesPerMonth, userCoursesPerMonth } = req.body;

        const newPlan = new InstitutePlan({
            name,
            duration,
            adminCoursesPerMonth,
            userCoursesPerMonth,
        });

        const plan = await newPlan.save();
        res.status(201).json(plan);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/institute-plans
// @desc    Get all institutional plans
// @access  Private (Admin)
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await InstitutePlan.find().sort({ createdAt: -1 });
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/institute-plans/:id
// @desc    Update an institutional plan
// @access  Private (Admin)
exports.updatePlan = async (req, res) => {
    try {
        const plan = await InstitutePlan.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!plan) {
            return res.status(404).json({ msg: 'Plan not found' });
        }

        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/institute-plans/:id
// @desc    Delete an institutional plan
// @access  Private (Admin)
exports.deletePlan = async (req, res) => {
    try {
        const plan = await InstitutePlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ msg: 'Plan not found' });
        }

        await plan.deleteOne();

        res.json({ msg: 'Plan removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
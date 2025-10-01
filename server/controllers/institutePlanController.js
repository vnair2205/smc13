const InstitutePlan = require('../models/institutePlan');

// @route   POST api/institute-plans
// @desc    Create a new institutional plan
// @access  Private (Admin)
// --- RENAMED to createInstitutePlan ---
exports.createInstitutePlan = async (req, res) => {
    try {
        const { name, duration, price, features, adminCoursesPerMonth, userCoursesPerMonth } = req.body;

        const newPlan = new InstitutePlan({
            name,
            duration,
            price,
            features,
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

// @route   GET api/institute-plans (paginated)
// @desc    Get all institutional plans with pagination
// @access  Private (Admin)
// --- RENAMED to getInstitutePlans ---
exports.getInstitutePlans = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
        };
        const plans = await InstitutePlan.paginate({}, options);
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @route   GET api/institute-plans/all
// @desc    Get all institute plans (for selection)
// @access  Private (Admin)
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await InstitutePlan.find().sort({ price: 1 });
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/institute-plans/:id
// @desc    Update an institutional plan
// @access  Private (Admin)
// --- RENAMED to updateInstitutePlan ---
exports.updateInstitutePlan = async (req, res) => {
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
// --- RENAMED to deleteInstitutePlan ---
exports.deleteInstitutePlan = async (req, res) => {
    try {
        const plan = await InstitutePlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ msg: 'Plan not found' });
        }

        await plan.deleteOne(); // Use deleteOne() for Mongoose v6+

        res.json({ msg: 'Plan removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
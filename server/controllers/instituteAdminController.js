const bcrypt = require('bcryptjs');
const InstituteAdmin = require('../models/InstituteAdmin');

// @route   PUT api/institute-admin/:id
// @desc    Update an institute admin's details
// @access  Private (Admin)
exports.updateAdminDetails = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const admin = await InstituteAdmin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ msg: 'Admin user not found' });
        }

        // Prepare fields to update
        const updatedFields = {
            firstName,
            lastName,
            email,
        };

        // If a new password is provided, hash it and include it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }

        const updatedAdmin = await InstituteAdmin.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true }
        ).select('-password'); // Exclude password from the response

        res.json(updatedAdmin);

    } catch (err) {
        console.error(err.message);
        // Handle potential duplicate email error
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'An admin with this email already exists.' });
        }
        res.status(500).send('Server Error');
    }
};
const LegalContent = require('../models/LegalContent');

// @route   GET api/legal
// @desc    Get terms and privacy content
// @access  Public
exports.getLegalContent = async (req, res) => {
    try {
        // Find the single document for legal content. If it doesn't exist, create it.
        let content = await LegalContent.findOne();
        if (!content) {
            content = new LegalContent();
            await content.save();
        }
        res.json(content);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/legal
// @desc    Update terms and privacy content
// @access  Private/Admin
exports.updateLegalContent = async (req, res) => {
    const { termsOfService, privacyPolicy } = req.body;

    const updateData = {};
    if (termsOfService !== undefined) {
        updateData.termsOfService = termsOfService;
    }
    if (privacyPolicy !== undefined) {
        updateData.privacyPolicy = privacyPolicy;
    }

    try {
        // Find and update the single legal document, or create it if it doesn't exist (upsert).
        const content = await LegalContent.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true }
        );
        res.json(content);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
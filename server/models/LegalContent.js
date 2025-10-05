const mongoose = require('mongoose');

const LegalContentSchema = new mongoose.Schema({
    termsOfService: {
        type: String,
        default: '<p>Please enter the Terms of Service here.</p>',
    },
    privacyPolicy: {
        type: String,
        default: '<p>Please enter the Privacy Policy here.</p>',
    },
}, { timestamps: true });

// Using a single document for legal content. This ensures we don't create multiple copies.
// You can add a pre-save hook if you want to strictly enforce a single document.

module.exports = mongoose.model('LegalContent', LegalContentSchema);
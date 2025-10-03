// server/routes/support.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your standard user authentication
const { upload } = require('../controllers/publicSupportTicketController'); // We can reuse the upload logic
const { createTicketForUser } = require('../controllers/supportTicketController');

// This is the new, secure route for creating a ticket.
// It uses the auth middleware to ensure only logged-in users can access it.
router.post('/', auth, upload.array('attachments', 5), createTicketForUser);

module.exports = router;
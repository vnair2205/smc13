// smc12/server/routes/adminSupport.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer'); // Using multer directly for clarity
const path = require('path');
const fs = require('fs');

const {
    getAllTickets,
    getTicketById,
    updateTicket,
    getAdmins
} = require('../controllers/adminSupportController');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/tickets';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Get all admins (middleware is correct here)
router.get('/admins', adminAuth, getAdmins);

// Route for getting all tickets (middleware is correct here)
router.get('/tickets', adminAuth, getAllTickets);

// Routes for a single ticket by ID
router.route('/tickets/:id')
    .get(adminAuth, getTicketById)
    // --- FIX: Add adminAuth middleware to the PUT route ---
    .put(adminAuth, upload.array('attachments', 5), updateTicket);

module.exports = router;
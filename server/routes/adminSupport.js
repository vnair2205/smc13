// server/routes/adminSupport.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { upload } = require('../controllers/publicSupportTicketController'); // Re-use the upload middleware
const {
    getAllTickets,
    getTicketById,
    updateTicket,
    getAdmins
} = require('../controllers/adminSupportController');

// Apply admin authentication to all routes
router.use(adminAuth);

router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id', upload.array('attachments', 5), updateTicket);
router.get('/admins', getAdmins);

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTicket,
  getUserTickets,
  upload,
  getSupportCategories,
  getTicketById,       // --- IMPORT NEW FUNCTION ---
  addReplyToTicket     // --- IMPORT NEW FUNCTION ---
} = require('../controllers/publicSupportTicketController');

// Apply authentication middleware to all routes in this file
router.use(auth);

// DEFINE THE ROUTE for GET /api/public/support/categories
router.get('/categories', getSupportCategories);

// DEFINE THE ROUTES for GET and POST /api/public/support/
router.route('/')
  .post(upload.array('attachments', 5), createTicket)
  .get(getUserTickets);
  
// --- NEW ROUTE for a single ticket ---
router.route('/:ticketId')
  .get(getTicketById);

// --- NEW ROUTE for replying to a ticket ---
router.route('/:ticketId/reply')
  .post(upload.array('attachments', 5), addReplyToTicket);

module.exports = router;
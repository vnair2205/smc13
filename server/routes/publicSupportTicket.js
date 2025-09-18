const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTicket,
  getUserTickets,
  upload,
  getSupportCategories,
  getTicketByIdForUser, // Import the new function
  addUserReply,         // Import the new function
} = require('../controllers/publicSupportTicketController');

// Apply authentication middleware to all routes in this file
router.use(auth);

// DEFINE THE ROUTE for GET /api/public/support/categories
router.get('/categories', getSupportCategories);

// DEFINE THE ROUTES for GET and POST /api/public/support/
router.route('/')
  .post(upload.array('attachments', 5), createTicket)
  .get(getUserTickets);

  router.get('/:id', getTicketByIdForUser);
router.post('/reply/:id', upload.array('attachments', 5), addUserReply);

module.exports = router;
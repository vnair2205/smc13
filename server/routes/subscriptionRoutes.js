// server/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
  getPublicPlans,
  getSubscriptionHistory, // <-- IMPORT
  getInvoiceDetails,      // <-- IMPORT
} = require('../controllers/subscriptionController');


// *** FIX: ADDED THE PUBLIC ROUTE. This does not have adminAuth middleware. ***
// This route MUST come BEFORE the '/:id' route to avoid conflicts.
router.get('/public', getPublicPlans);
router.get('/history', auth, getSubscriptionHistory);
router.get('/invoice/:id', auth, getInvoiceDetails);


// --- Admin Protected Routes ---
router.post('/', adminAuth, createPlan);
router.get('/', adminAuth, getAllPlans);
router.put('/:id', adminAuth, updatePlan);
router.delete('/:id', adminAuth, deletePlan);

module.exports = router;
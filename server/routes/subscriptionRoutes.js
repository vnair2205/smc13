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
  getSubscriptionHistory,
  getInvoiceDetails,
  getSubscriptionStatus, // <-- 1. IMPORT the new function
} = require('../controllers/subscriptionController');


// Public and User-Specific Routes
router.get('/public', getPublicPlans);
router.get('/history', auth, getSubscriptionHistory);
router.get('/invoice/:id', auth, getInvoiceDetails);
router.get('/status', auth, getSubscriptionStatus); // <-- 2. ADD the new route


// --- Admin Protected Routes ---
router.post('/', adminAuth, createPlan);
router.get('/', adminAuth, getAllPlans);
router.put('/:id', adminAuth, updatePlan);
router.delete('/:id', adminAuth, deletePlan);

module.exports = router;
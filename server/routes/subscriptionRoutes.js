// server/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
  getPublicPlans, // <-- IMPORT THE NEW FUNCTION
} = require('../controllers/subscriptionController');


// *** FIX: ADDED THE PUBLIC ROUTE. This does not have adminAuth middleware. ***
// This route MUST come BEFORE the '/:id' route to avoid conflicts.
router.get('/public', getPublicPlans);


// --- Admin Protected Routes ---
router.post('/', adminAuth, createPlan);
router.get('/', adminAuth, getAllPlans); // This gets all plans for the admin panel
router.put('/:id', adminAuth, updatePlan);
router.delete('/:id', adminAuth, deletePlan);

module.exports = router;
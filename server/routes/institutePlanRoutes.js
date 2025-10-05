const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { createPlan, getAllPlans, updatePlan, deletePlan } = require('../controllers/institutePlanController');

// --- Admin Protected Routes ---
router.post('/', adminAuth, createPlan);
router.get('/', adminAuth, getAllPlans);
router.put('/:id', adminAuth, updatePlan);
router.delete('/:id', adminAuth, deletePlan);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
    createInstitutePlan,
    getInstitutePlans,
    updateInstitutePlan,
    deleteInstitutePlan,
    getAllPlans
} = require('../controllers/institutePlanController');


// --- Admin Protected Routes ---
router.post('/', adminAuth, createInstitutePlan);
router.get('/', adminAuth, getInstitutePlans); // This now correctly points to the paginated results
router.put('/:id', adminAuth, updateInstitutePlan);
router.delete('/:id', adminAuth, deleteInstitutePlan);

// This route gets all plans without pagination, for dropdowns/modals
router.get('/all', adminAuth, getAllPlans);

module.exports = router;
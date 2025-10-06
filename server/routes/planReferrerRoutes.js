// server/routes/planReferrerRoutes.js
const express = require('express');
const router = express.Router();
const {
    createReferrer,
    getReferrers,
    updateReferrer,
} = require('../controllers/planReferrerController');
const adminAuth = require('../middleware/adminAuth');

// All routes are protected and can only be accessed by an admin
router.route('/')
    .post(adminAuth, createReferrer)
    .get(adminAuth, getReferrers);

router.route('/:id')
    .put(adminAuth, updateReferrer);

module.exports = router;
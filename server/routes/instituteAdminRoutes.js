const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { updateAdminDetails } = require('../controllers/instituteAdminController');

// @route   PUT api/institute-admin/:id
router.put('/:id', adminAuth, updateAdminDetails);

module.exports = router;
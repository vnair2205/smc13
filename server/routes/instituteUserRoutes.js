const express = require('express');
const router = express.Router();
const instituteUserController = require('../controllers/instituteUserController');
const { adminAuth } = require('../middleware/adminAuth');

router.post('/', adminAuth, instituteUserController.createInstituteUser);
// Add GET, PUT, and DELETE routes

module.exports = router;
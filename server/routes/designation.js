// server/routes/designation.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const designationController = require('../controllers/designationController');

router.use(adminAuth);

router.route('/')
  .get(designationController.getDesignations)
  .post(designationController.addDesignation);

router.route('/:id')
  .put(designationController.updateDesignation)
  .delete(designationController.deleteDesignation);

module.exports = router;
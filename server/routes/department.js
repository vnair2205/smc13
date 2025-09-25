// server/routes/department.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const departmentController = require('../controllers/departmentController');

router.use(adminAuth);

router.route('/')
  .get(departmentController.getDepartments)
  .post(departmentController.addDepartment);

router.route('/:id')
  .put(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

module.exports = router;
// server/routes/knowledgebaseCategory.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/knowledgebaseCategoryController');

// All routes are protected by admin authentication
router.use(adminAuth);

router.route('/')
  .get(getCategories)
  .post(addCategory);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
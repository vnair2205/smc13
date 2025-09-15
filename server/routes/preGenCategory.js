const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const preGenCategoryController = require('../controllers/preGenCategoryController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(adminAuth);

// --- Get routes for each category type ---
router.get('/category', preGenCategoryController.getCategories);
router.get('/subcategory1', preGenCategoryController.getSubCategories1);
router.get('/subcategory2', preGenCategoryController.getSubCategories2);
router.get('/subcategory1/by-parent/:parentId', preGenCategoryController.getSubCategories1ByParent);

// Create routes
router.post('/category', preGenCategoryController.createCategory);
router.post('/subcategory1', preGenCategoryController.createSubCategory1);
router.post('/subcategory2', preGenCategoryController.createSubCategory2);

// --- NEW: Update Routes ---
router.put('/category/:id', preGenCategoryController.updateCategory);
router.put('/subcategory1/:id', preGenCategoryController.updateSubCategory1);
router.put('/subcategory2/:id', preGenCategoryController.updateSubCategory2);

// --- NEW: Delete Routes ---
router.delete('/category/:id', preGenCategoryController.deleteCategory);
router.delete('/subcategory1/:id', preGenCategoryController.deleteSubCategory1);
router.delete('/subcategory2/:id', preGenCategoryController.deleteSubCategory2);

// Bulk upload route
router.post('/bulk-upload', upload.single('file'), preGenCategoryController.bulkUpload);

router.get('/subcategory2/by-parent/:parentId', preGenCategoryController.getSubCategories2ByParent);

module.exports = router;
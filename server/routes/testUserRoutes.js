const express = require('express');
const router = express.Router();
const { addTestUser, getTestUsers, updateTestUser, bulkUploadTestUsers } = require('../controllers/testUserController');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', adminAuth, addTestUser);
router.get('/', adminAuth, getTestUsers);
router.put('/:id', adminAuth, updateTestUser);
router.post('/bulk-upload', adminAuth, upload.single('file'), bulkUploadTestUsers);

module.exports = router;
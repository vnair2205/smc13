const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminAuth = require('../middleware/adminAuth');
const {
    createInstitute,
    getInstitutes,
    getInstituteStats,
    getInstituteById,
    addClass,
    addSection,
    addSubject,
    bulkUploadSubjects,
    addTeacher,
    addInstituteUser,
    updateInstitutePlan,
    updateInstituteDetails,
    updateClass,
    deleteClass,
    updateSection,
    deleteSection,
    updateSubject,
    deleteSubject,
    updateTeacher,
    deleteTeacher,
    updateInstituteUser,  
    deleteInstituteUser,   
    bulkUploadInstituteUsers

} = require('../controllers/instituteController');

const upload = multer({ storage: multer.memoryStorage() });

// --- Admin Protected Routes ---
router.post('/', adminAuth, createInstitute);
router.get('/', adminAuth, getInstitutes);
router.get('/stats', adminAuth, getInstituteStats);
router.get('/:id', adminAuth, getInstituteById);

// Class, Section, Subject, Teacher, User routes
router.post('/:id/classes', adminAuth, addClass);
router.post('/:id/sections', adminAuth, addSection);
router.post('/:id/subjects', adminAuth, addSubject);
router.post('/:id/subjects/bulk-upload', adminAuth, upload.single('file'), bulkUploadSubjects);
router.post('/:id/teachers', adminAuth, addTeacher);
router.post('/:id/users', adminAuth, addInstituteUser);
router.put('/:id/plan', adminAuth, updateInstitutePlan);
router.put('/:id/details', adminAuth, updateInstituteDetails);
router.put('/classes/:classId', adminAuth, updateClass); 
router.delete('/classes/:classId', adminAuth, deleteClass);
router.put('/sections/:sectionId', adminAuth, updateSection);
router.delete('/sections/:sectionId', adminAuth, deleteSection);
router.put('/subjects/:subjectId', adminAuth, updateSubject); 
router.delete('/subjects/:subjectId', adminAuth, deleteSubject);
router.put('/teachers/:teacherId', adminAuth, updateTeacher); 
router.delete('/teachers/:teacherId', adminAuth, deleteTeacher);
router.put('/users/:userId', adminAuth, updateInstituteUser);
router.delete('/users/:userId', adminAuth, deleteInstituteUser);
router.post('/:id/users/bulk-upload', adminAuth, upload.single('file'), bulkUploadInstituteUsers);

module.exports = router;
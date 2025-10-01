import api from '../utils/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'x-auth-token': token } };
};

const instituteService = {
    getInstitutes: (params) => api.get('/institutes', { ...getAuthHeaders(), params }),
    getInstituteStats: () => api.get('/institutes/stats', getAuthHeaders()),
    createInstitute: (instituteData) => api.post('/institutes', instituteData, getAuthHeaders()),
    getInstituteById: (id) => api.get(`/institutes/${id}`, getAuthHeaders()), // <-- Add this line

    // Add other service calls here as you build the components
    addClass: (instituteId, data) => api.post(`/institutes/${instituteId}/classes`, data, getAuthHeaders()),
    addSection: (instituteId, data) => api.post(`/institutes/${instituteId}/sections`, data, getAuthHeaders()),
    addSubject: (instituteId, data) => api.post(`/institutes/${instituteId}/subjects`, data, getAuthHeaders()),
    bulkUploadSubjects: (instituteId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/institutes/${instituteId}/subjects/bulk-upload`, formData, {
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    addTeacher: (instituteId, data) => api.post(`/institutes/${instituteId}/teachers`, data, getAuthHeaders()),
   addInstituteUser: (instituteId, data) => api.post(`/institutes/${instituteId}/users`, data, getAuthHeaders()),
    updateInstitutePlan: (instituteId, planId) => api.put(`/institutes/${instituteId}/plan`, { planId }, getAuthHeaders()),
    updateInstituteDetails: (instituteId, details) => api.put(`/institutes/${instituteId}/details`, details, getAuthHeaders()),
     updateClass: (classId, data) => api.put(`/institutes/classes/${classId}`, data, getAuthHeaders()),
    deleteClass: (classId) => api.delete(`/institutes/classes/${classId}`, getAuthHeaders()),
    updateSection: (sectionId, data) => api.put(`/institutes/sections/${sectionId}`, data, getAuthHeaders()),
    deleteSection: (sectionId) => api.delete(`/institutes/sections/${sectionId}`, getAuthHeaders()),
    updateSubject: (subjectId, data) => api.put(`/institutes/subjects/${subjectId}`, data, getAuthHeaders()),
    deleteSubject: (subjectId) => api.delete(`/institutes/subjects/${subjectId}`, getAuthHeaders()),
    updateTeacher: (teacherId, data) => api.put(`/institutes/teachers/${teacherId}`, data, getAuthHeaders()),
    deleteTeacher: (teacherId) => api.delete(`/institutes/teachers/${teacherId}`, getAuthHeaders()),
    // --- Add these new functions ---
    updateInstituteUser: (userId, data) => api.put(`/institutes/users/${userId}`, data, getAuthHeaders()),
    deleteInstituteUser: (userId) => api.delete(`/institutes/users/${userId}`, getAuthHeaders()),
  bulkUploadInstituteUsers: (instituteId, file, classId, sectionId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('classId', classId);
        formData.append('sectionId', sectionId);
        
        return api.post(`/institutes/${instituteId}/users/bulk-upload`, formData, {
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
        


export default instituteService;
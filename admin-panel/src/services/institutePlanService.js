import api from '../utils/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'x-auth-token': token } };
};

const institutePlanService = {
    // ... (keep your existing functions)
    createInstitutePlan: (planData) => api.post('/institute-plans', planData, getAuthHeaders()),
    getInstitutePlans: (params) => api.get('/institute-plans', { ...getAuthHeaders(), params }),
    updateInstitutePlan: (id, planData) => api.put(`/institute-plans/${id}`, planData, getAuthHeaders()),
    deleteInstitutePlan: (id) => api.delete(`/institute-plans/${id}`, getAuthHeaders()),

    // --- Add this new function ---
    getAllPlans: () => api.get('/institute-plans/all', getAuthHeaders()),
};

export default institutePlanService;
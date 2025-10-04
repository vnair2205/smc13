import api from '../utils/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'x-auth-token': token } };
};

const institutePlanService = {
    getPlans: () => api.get('/institute-plans', getAuthHeaders()),
    createPlan: (planData) => api.post('/institute-plans', planData, getAuthHeaders()),
    updatePlan: (id, planData) => api.put(`/institute-plans/${id}`, planData, getAuthHeaders()), // --- NEW ---
    deletePlan: (id) => api.delete(`/institute-plans/${id}`, getAuthHeaders()), // --- NEW ---
};

export default institutePlanService;
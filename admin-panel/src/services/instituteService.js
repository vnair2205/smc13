import api from '../utils/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'x-auth-token': token } };
};

const instituteService = {
    getInstitutes: (params) => api.get('/institutes', { ...getAuthHeaders(), params }),
    getInstituteStats: () => api.get('/institutes/stats', getAuthHeaders()),
    createInstitute: (instituteData) => api.post('/institutes', instituteData, getAuthHeaders()),
};

export default instituteService;
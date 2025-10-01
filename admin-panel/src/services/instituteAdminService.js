import api from '../utils/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'x-auth-token': token } };
};

const instituteAdminService = {
    updateAdminDetails: (adminId, adminData) => api.put(`/institute-admin/${adminId}`, adminData, getAuthHeaders()),
};

export default instituteAdminService;
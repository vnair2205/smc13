import api from '../utils/api';

const instituteUserService = {
  getUsersByInstitute: (instituteId) => api.get(`/institute-users/institute/${instituteId}`),
  createInstituteUser: (userData) => api.post('/institute-users', userData),
  // Add update and delete functions here
};

export default instituteUserService;
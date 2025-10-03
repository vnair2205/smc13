import api from '../utils/api';

const classService = {
  getClassesByInstitute: (instituteId) => api.get(`/classes/institute/${instituteId}`),
  createClass: (classData) => api.post('/classes', classData),
  // Add update and delete functions here
};

export default classService;
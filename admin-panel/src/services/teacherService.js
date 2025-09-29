import api from '../utils/api';

const teacherService = {
  getTeachersByInstitute: (instituteId) => api.get(`/teachers/institute/${instituteId}`),
  createTeacher: (teacherData) => api.post('/teachers', teacherData),
  // Add update and delete functions here
};

export default teacherService;
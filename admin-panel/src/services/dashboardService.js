import api from './api';

const getDashboardStats = () => {
  return api.get('/dashboard/stats');
};

const getUserGrowthData = () => {
  return api.get('/dashboard/user-growth');
};

const getCourseGenerationData = () => {
  return api.get('/dashboard/course-generation');
};

// ... other dashboard data fetching functions

const dashboardService = {
  getDashboardStats,
  getUserGrowthData,
  getCourseGenerationData,
};

export default dashboardService;
// admin-panel/src/services/reportService.js

import api from './api';

export const getUserReport = (page = 1, limit = 100) => {
  // Note the new URL path '/reports/user'
  return api.get(`/reports/user?page=${page}&limit=${limit}`);
};

const reportService = {
  getUserReport,
};

export default reportService;
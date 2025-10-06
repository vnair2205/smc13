// admin-panel/src/services/dashboardService.js
import api from './api';

export const getDashboardAnalytics = async () => {
    try {
        const response = await api.get('/dashboard/analytics');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        throw error;
    }
};
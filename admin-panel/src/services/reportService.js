// admin-panel/src/services/reportService.js
import api from './api';

/**
 * Get user report data with pagination.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {Promise<Object>} The report data.
 */
export const getUserReport = async (page = 1, limit = 100) => {
    try {
        const response = await api.get(`/reports/user?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user report:', error);
        throw error;
    }
};

/**
 * Get subscription report data with filters and pagination.
 * @param {object} params - The query parameters.
 * @param {number} params.page - The current page number.
 * @param {number} params.limit - The number of items per page.
 * @param {string} params.search - The search term.
 * @param {string} params.planFilter - The ID of the plan to filter by.
 * @returns {Promise<Object>} The report data.
 */
export const getSubscriptionReport = async ({ page = 1, limit = 100, search = '', planFilter = '' }) => {
    try {
        const response = await api.get('/reports/subscription', {
            params: { page, limit, search, planFilter }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching subscription report:', error);
        throw error;
    }
};

export const getPregeneratedCourseReport = async ({ search = '', category = '' }) => {
    try {
        const response = await api.get('/reports/pregenerated', {
            params: { search, category }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching pre-generated course report:', error);
        throw error;
    }
};

export const getPregeneratedCourseAccessDetails = async (id) => {
    try {
        const response = await api.get(`/reports/pregenerated/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pre-generated course access details:', error);
        throw error;
    }
};


export const getCourseReport = async ({ page = 1, limit = 100, search = '', status = '', language = '' }) => {
    try {
        const response = await api.get('/reports/courses', {
            params: { page, limit, search, status, language }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching course report:', error);
        throw error;
    }
};


export const getCertificateReport = async ({ search = '', page = 1, limit = 100 }) => {
    try {
        const response = await api.get('/reports/certificates', {
            params: { search, page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching certificate report:', error);
        throw error;
    }
};

export const getChurnReport = async ({ page = 1, limit = 100, search = '' }) => {
    try {
        const response = await api.get('/reports/churn', {
            params: { page, limit, search }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching churn report:', error);
        throw error;
    }
};


export const getDroppedCustomersReport = async ({ page = 1, limit = 100, search = '' }) => {
    try {
        const response = await api.get('/reports/dropped-customers', {
            params: { page, limit, search }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dropped customers report:', error);
        throw error;
    }
};
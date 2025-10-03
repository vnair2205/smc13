// admin-panel/src/services/referrerService.js
import api from './api'; // Use the configured api instance

const getReferrers = async () => {
    try {
        // No need to set headers here, the interceptor in api.js does it
        const response = await api.get('/referrers');
        return response.data;
    } catch (error) {
        console.error('Error fetching referrers:', error);
        throw error;
    }
};

const createReferrer = async (referrerData) => {
    try {
        const response = await api.post('/referrers', referrerData);
        return response.data;
    } catch (error) {
        console.error('Error creating referrer:', error);
        throw error;
    }
};

const updateReferrer = async (id, referrerData) => {
    try {
        const response = await api.put(`/referrers/${id}`, referrerData);
        return response.data;
    } catch (error) {
        console.error('Error updating referrer:', error);
        throw error;
    }
};

const referrerService = {
    getReferrers,
    createReferrer,
    updateReferrer,
};

export default referrerService;
import api from './api';

export const addTestUser = (userData) => {
  return api.post('/test-users', userData);
};

export const getTestUsers = () => {
  return api.get('/test-users');
};

export const updateTestUser = (id, userData) => {
    return api.put(`/test-users/${id}`, userData);
};

export const bulkUploadTestUsers = (formData) => {
    return api.post('/test-users/bulk-upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getSubscriptionPlans = () => {
    // FIX: Changed the endpoint to the correct one
    return api.get('/subscriptions/plans');
};
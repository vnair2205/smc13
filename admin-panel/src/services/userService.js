// admin-panel/src/services/userService.js
import axios from 'axios';

const API_URL = '/api/admin/users';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
        },
    };
};

export const getUserStats = async () => {
    const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
    return response.data;
};

export const getUsers = async (page = 1, limit = 10, search = '', status = '') => {
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}&search=${search}&status=${status}`, getAuthHeaders());
    return response.data;
};

export const getUserDetails = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
};

/**
 * NEW FUNCTION: Updates the status of a user (active/inactive).
 * @param {string} userId - The ID of the user to update.
 * @param {object} data - The data to update, e.g., { isActive: true }.
 */
export const updateUserStatus = async (userId, data) => {
    const response = await axios.put(`${API_URL}/${userId}`, data, getAuthHeaders());
    return response.data;
};

export const changeUserPlan = async (userId, newPlanId) => {
    const body = JSON.stringify({ userId, newPlanId });
    const response = await axios.post(`${API_URL}/change-plan`, body, getAuthHeaders());
    return response.data;
};


export const addCourseCount = async (userId, additionalCourses) => {
    const body = JSON.stringify({ userId, additionalCourses });
    const response = await axios.post(`${API_URL}/add-courses`, body, getAuthHeaders());
    return response.data;
};

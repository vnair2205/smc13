import axios from 'axios';
import api from '../utils/api';
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

// 👇 FIX: Re-added the missing 'export' keywords to these functions.

export const getUserStats = async () => {
  try {
    const res = await api.get('/admin/users/stats');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch user stats', error);
    throw error;
  }
};

export const getUsers = async (page = 1, limit = 10, searchTerm = '', statusFilter = '') => {
  try {
    const res = await api.get('/admin/users', {
      params: { page, limit, search: searchTerm, status: statusFilter }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch users', error);
    throw error;
  }
};

export const getUserDetails = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
};

export const updateUserDetails = async (userId, data) => {
    const response = await axios.put(`${API_URL}/${userId}`, data, getAuthHeaders());
    return response.data;
};

// This function is also needed by UserDetailsPage
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
    const response = await axios.post(`${API_URL}/add-course-count`, body, getAuthHeaders());
    return response.data;
};

export const getUserCourses = async (userId) => {
    const response = await axios.get(`${API_URL}/${userId}/courses`, getAuthHeaders());
    return response.data;
};

export const getCourseForUser = async (userId, courseId) => {
  const response = await api.get(`/admin/users/${userId}/courses/${courseId}`);
  return response.data;
};


export const getChatForUserCourse = async (userId, courseId) => {
  const response = await api.get(`/admin/users/${userId}/courses/${courseId}/chat`);
  return response.data;
};


export const getUserAllCourses = async (userId) => {
    try {
        const res = await api.get(`/admin/users/${userId}/courses`);
        return res.data;
    } catch (err) {
        console.error('Failed to fetch user courses', err);
        throw err;
    }
};

import axios from 'axios';

const API_URL = '/api/public-pre-gen-courses';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Assumes user token is named 'token'
    return { headers: { 'x-auth-token': token } };
};

export const getPreGenCourses = (filters = {}, page = 1) => {
    // Set the limit to 50 and remove subCategory1
    const params = new URLSearchParams({ page, limit: 50 });
    if (filters.category) params.append('category', filters.category);
    if (filters.language) params.append('language', filters.language);
    if (filters.search) params.append('search', filters.search);
    
    return axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());
};

export const getCategoryCounts = () => {
    return axios.get(`${API_URL}/category-counts`, getAuthHeaders());
};

export const getPreGenCourseById = (id) => {
    return axios.get(`${API_URL}/${id}`, getAuthHeaders());
};

export const startCourse = (id) => {
    return axios.post(`${API_URL}/${id}/start`, {}, getAuthHeaders());
};
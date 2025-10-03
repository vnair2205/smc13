import axios from 'axios';

const API_URL = '/api/pre-gen-course';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'x-auth-token': token } };
};

export const generateDescription = (data) => {
    return axios.post(`${API_URL}/generate-description`, data, getAuthHeaders());
};

export const createPreGenCourse = (data) => {
    return axios.post(`${API_URL}/generate`, data, getAuthHeaders());
};

export const getPreGenCourses = (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (filters.category) params.append('category', filters.category);
    if (filters.subCategory1) params.append('subCategory1', filters.subCategory1);
    if (filters.search) params.append('search', filters.search);
    
    return axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());
};

export const getPreGenCourseById = (id) => {
    return axios.get(`${API_URL}/${id}`, getAuthHeaders());
};

export const bulkGenerateCourses = (formData) => {
    const config = getAuthHeaders();
    config.headers['Content-Type'] = 'multipart/form-data';
    return axios.post(`${API_URL}/bulk-generate`, formData, config);
};

export const getSubCategories2ByParent = (parentId) => {
    return axios.get(`${API_URL}/subcategory2/by-parent/${parentId}`, getAuthHeaders());
};

export const deletePreGenCourse = (id) => {
    return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};
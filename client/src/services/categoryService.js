import axios from 'axios';

const API_URL = '/api/public-pre-gen-courses';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { 'x-auth-token': token } };
};

export const getCategoryCounts = () => {
    return axios.get(`${API_URL}/category-counts`, getAuthHeaders());
};

// Function to get categories for filter dropdowns
export const getCategories = (page = 1, limit = 1000) => {
    return axios.get(`/api/pre-gen-category/category?page=${page}&limit=${limit}`, getAuthHeaders());
};

// Function to get subcategories for filter dropdowns
export const getSubCategories1ByParent = (parentId) => {
    return axios.get(`/api/pre-gen-category/subcategory1/by-parent/${parentId}`, getAuthHeaders());
};
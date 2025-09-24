import axios from 'axios';

const API_URL = '/api/pre-gen-category';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'x-auth-token': token } };
};

export const getCategories = (page = 1, limit = 10) => {
    return axios.get(`${API_URL}/category?page=${page}&limit=${limit}`, getAuthHeaders());
};

export const getSubCategories1ByParent = (parentId) => {
    return axios.get(`${API_URL}/subcategory1/by-parent/${parentId}`, getAuthHeaders());
};

// --- THIS IS THE MISSING FUNCTION ---
export const getSubCategories2ByParent = (parentId) => {
    return axios.get(`${API_URL}/subcategory2/by-parent/${parentId}`, getAuthHeaders());
};
// ------------------------------------

export const getSubCategories1 = (page = 1, limit = 10) => {
    return axios.get(`${API_URL}/subcategory1?page=${page}&limit=${limit}`, getAuthHeaders());
};

export const getSubCategories2 = (page = 1, limit = 10) => {
    return axios.get(`${API_URL}/subcategory2?page=${page}&limit=${limit}`, getAuthHeaders());
};

export const createCategory = (data) => {
    return axios.post(`${API_URL}/category`, data, getAuthHeaders());
};

export const createSubCategory1 = (data) => {
    return axios.post(`${API_URL}/subcategory1`, data, getAuthHeaders());
};

export const createSubCategory2 = (data) => {
    return axios.post(`${API_URL}/subcategory2`, data, getAuthHeaders());
};

export const updateCategory = (id, data) => {
    return axios.put(`${API_URL}/category/${id}`, data, getAuthHeaders());
};
export const updateSubCategory1 = (id, data) => {
    return axios.put(`${API_URL}/subcategory1/${id}`, data, getAuthHeaders());
};
export const updateSubCategory2 = (id, data) => {
    return axios.put(`${API_URL}/subcategory2/${id}`, data, getAuthHeaders());
};

export const deleteCategory = (id) => {
    return axios.delete(`${API_URL}/category/${id}`, getAuthHeaders());
};
export const deleteSubCategory1 = (id) => {
    return axios.delete(`${API_URL}/subcategory1/${id}`, getAuthHeaders());
};
export const deleteSubCategory2 = (id) => {
    return axios.delete(`${API_URL}/subcategory2/${id}`, getAuthHeaders());
};

export const bulkUpload = (formData) => {
    const config = getAuthHeaders();
    config.headers['Content-Type'] = 'multipart/form-data';
    return axios.post(`${API_URL}/bulk-upload`, formData, config);
};
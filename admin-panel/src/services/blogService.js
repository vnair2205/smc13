// admin-panel/src/services/blogService.js
import axios from 'axios';

const CATEGORY_API_URL = '/api/blogs/category';
const BLOG_API_URL = '/api/blogs/article';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { headers: { 'x-auth-token': token } };
};

// Category Functions
export const getCategories = () => axios.get(CATEGORY_API_URL, getAuthHeaders());
export const addCategory = (name) => axios.post(CATEGORY_API_URL, { name }, getAuthHeaders());
export const updateCategory = (id, name) => axios.put(`${CATEGORY_API_URL}/${id}`, { name }, getAuthHeaders());
export const deleteCategory = (id) => axios.delete(`${CATEGORY_API_URL}/${id}`, getAuthHeaders());

// Blog Functions
export const getBlogs = (params) => axios.get(BLOG_API_URL, { ...getAuthHeaders(), params });
export const getBlogById = (id) => axios.get(`${BLOG_API_URL}/${id}`, getAuthHeaders());
export const deleteBlog = (id) => axios.delete(`${BLOG_API_URL}/${id}`, getAuthHeaders());

// For add/update, we need to handle multipart/form-data
export const addBlog = (formData) => {
    const token = localStorage.getItem('adminToken');
    return axios.post(BLOG_API_URL, formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
    });
};

export const updateBlog = (id, formData) => {
    const token = localStorage.getItem('adminToken');
    return axios.put(`${BLOG_API_URL}/${id}`, formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
    });
};
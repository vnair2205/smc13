// client/src/services/blogService.js
import axios from 'axios';

const API_URL = '/api/public/blogs';

export const getBlogs = (params) => axios.get(API_URL, { params });
export const getBlogById = (id) => axios.get(`${API_URL}/${id}`);
export const getCategories = () => axios.get(`${API_URL}/categories`);
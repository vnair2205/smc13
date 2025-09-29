// client/src/services/knowledgebaseService.js
import axios from 'axios';

const API_URL = '/api/public/kb';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { 'x-auth-token': token } };
};

export const getCategories = () => axios.get(`${API_URL}/categories`, getAuthHeaders());
export const getArticles = (params) => axios.get(`${API_URL}/articles`, { ...getAuthHeaders(), params });
export const getArticleById = (id) => axios.get(`${API_URL}/articles/${id}`, getAuthHeaders());
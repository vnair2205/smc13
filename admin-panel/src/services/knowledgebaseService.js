// admin-panel/src/services/knowledgebaseService.js
import axios from 'axios';

// --- CATEGORY API ---
const CATEGORY_API_URL = '/api/knowledgebase/category';
// --- ARTICLE API ---
const ARTICLE_API_URL = '/api/knowledgebase/article';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { headers: { 'x-auth-token': token } };
};

// Category Functions
export const getCategories = () => axios.get(CATEGORY_API_URL, getAuthHeaders());
export const addCategory = (name) => axios.post(CATEGORY_API_URL, { name }, getAuthHeaders());
export const updateCategory = (id, name) => axios.put(`${CATEGORY_API_URL}/${id}`, { name }, getAuthHeaders());
export const deleteCategory = (id) => axios.delete(`${CATEGORY_API_URL}/${id}`, getAuthHeaders());

// --- NEW ARTICLE FUNCTIONS ---
export const getArticles = (params) => axios.get(ARTICLE_API_URL, { ...getAuthHeaders(), params });
export const addArticle = (articleData) => axios.post(ARTICLE_API_URL, articleData, getAuthHeaders());
export const updateArticle = (id, articleData) => axios.put(`${ARTICLE_API_URL}/${id}`, articleData, getAuthHeaders());
export const deleteArticle = (id) => axios.delete(`${ARTICLE_API_URL}/${id}`, getAuthHeaders());
export const getArticleById = (id) => axios.get(`${ARTICLE_API_URL}/${id}`, getAuthHeaders());
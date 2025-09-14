import axios from 'axios';

const API_URL = '/api/public/support';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { 'x-auth-token': token } };
};

// This now correctly calls GET /api/public/support/categories with the user's token
export const getCategories = () => axios.get(`${API_URL}/categories`, getAuthHeaders());

export const getUserTickets = (params) => axios.get(API_URL, { ...getAuthHeaders(), params });

export const createTicket = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(API_URL, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};
// client/src/services/supportService.js
import axios from 'axios';

const API_URL = '/api/public/support';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { 'x-auth-token': token } };
};

export const getCategories = () => axios.get(`${API_URL}/categories`, getAuthHeaders());

export const getUserTickets = (params) => axios.get(API_URL, { ...getAuthHeaders(), params });

// Add these new functions
export const getTicketById = (id) => axios.get(`${API_URL}/${id}`, getAuthHeaders());

export const addReply = (id, formData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/reply/${id}`, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};


export const createTicket = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(API_URL, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};
// client/src/services/supportService.js
import axios from 'axios';

// --- FIX: Point to the new, secure user-specific API endpoint ---
const USER_API_URL = '/api/support';
const PUBLIC_API_URL = '/api/public/support'; // Keep this for fetching categories

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { 'x-auth-token': token } };
};

export const getCategories = () => axios.get(`${PUBLIC_API_URL}/categories`, getAuthHeaders());

export const getUserTickets = (params) => axios.get(PUBLIC_API_URL, { ...getAuthHeaders(), params });

// --- FIX: This function now correctly points to the secure route ---
export const createTicket = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(USER_API_URL, formData, { // Use USER_API_URL
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getTicketById = (id) => axios.get(`${PUBLIC_API_URL}/${id}`, getAuthHeaders());

export const addReply = (id, formData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${PUBLIC_API_URL}/reply/${id}`, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};
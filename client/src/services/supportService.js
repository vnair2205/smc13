import axios from 'axios';

const API_URL = '/api/public/support';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { 'x-auth-token': token } };
};

export const getCategories = () => axios.get(`${API_URL}/categories`, getAuthHeaders());

export const getUserTickets = (params) => axios.get(API_URL, { ...getAuthHeaders(), params });

// --- NEW FUNCTION ---
// Get a single ticket by its ID
export const getTicketById = (ticketId) => axios.get(`${API_URL}/${ticketId}`, getAuthHeaders());

export const createTicket = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(API_URL, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};

// --- NEW FUNCTION ---
// Add a reply to a ticket
export const addReply = (ticketId, formData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/${ticketId}/reply`, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};
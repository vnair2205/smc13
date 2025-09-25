import axios from 'axios';

const API_URL = '/api/admin/support';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken'); // Assuming admin token is stored here
  return { headers: { 'x-auth-token': token } };
};

// Fetch all support tickets for the admin panel
export const getAllTickets = (params) => {
  return axios.get(`${API_URL}/tickets`, { ...getAuthHeaders(), params });
};

// Fetch a single ticket by its ID
export const getTicketById = (id) => {
  return axios.get(`${API_URL}/tickets/${id}`, getAuthHeaders());
};

// Update a ticket (reply, change status, assign)
export const updateTicket = (id, formData) => {
  const token = localStorage.getItem('adminToken');
  return axios.put(`${API_URL}/tickets/${id}`, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Fetch all admin users
export const getAdmins = () => {
  return axios.get(`${API_URL}/admins`, getAuthHeaders());
};

// We also need to fetch support categories for the filter dropdown
export const getSupportCategories = () => {
    const token = localStorage.getItem('adminToken');
    return axios.get('/api/support-ticket-categories', { 
        headers: { 'x-auth-token': token } 
    });
};
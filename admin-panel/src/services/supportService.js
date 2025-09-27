// admin-panel/src/services/supportService.js
import axios from 'axios';

// --- API URLs ---
const CATEGORY_API_URL = '/api/support/category';
const ADMIN_TICKETS_API_URL = '/api/admin/support/tickets';
const ADMIN_LIST_API_URL = '/api/admin/support/admins';

// --- Helper for Auth Headers ---
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { headers: { 'x-auth-token': token } };
};

// --- Category Management ---
export const getCategories = () => axios.get(CATEGORY_API_URL, getAuthHeaders());
export const addCategory = (name) => axios.post(CATEGORY_API_URL, { name }, getAuthHeaders());
export const updateCategory = (id, name) => axios.put(`${CATEGORY_API_URL}/${id}`, { name }, getAuthHeaders());
export const deleteCategory = (id) => axios.delete(`${CATEGORY_API_URL}/${id}`, getAuthHeaders());

// --- Ticket Management (New) ---
export const getAllTickets = (params) => axios.get(ADMIN_TICKETS_API_URL, { ...getAuthHeaders(), params });
export const getTicketById = (id) => axios.get(`${ADMIN_TICKETS_API_URL}/${id}`, getAuthHeaders());

export const updateTicket = (id, formData) => {
    const token = localStorage.getItem('adminToken');
    return axios.put(`${ADMIN_TICKETS_API_URL}/${id}`, formData, {
        headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
        }
    });
};


// --- Admin User Management (New) ---
export const getAdmins = () => axios.get(ADMIN_LIST_API_URL, getAuthHeaders());
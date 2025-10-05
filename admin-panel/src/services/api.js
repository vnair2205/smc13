// admin-panel/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

/*
  !!! IMPORTANT FIX !!!
  This part adds an "interceptor" that runs before every API request.
  It automatically finds the 'adminToken' in localStorage and adds it 
  to the request headers, solving the "401 Unauthorized" error.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
// client/src/services/paymentService.js
import axios from 'axios';

const paymentApi = axios.create({
  baseURL: '/api/payments'
});

paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- FIX STARTS HERE ---
// Modified to accept planId and send it in the request body
const createOrder = (planId) => {
  return paymentApi.post('/create-order', { planId });
};
// --- FIX ENDS HERE ---


const verifyPayment = (paymentData) => {
  return paymentApi.post('/verify-payment', paymentData);
};

const paymentService = {
  createOrder,
  verifyPayment,
};

export default paymentService;
// client/src/services/paymentService.js
import axios from 'axios';

const API_URL = '/api/payments';

const createOrder = (email) => {
  return axios.post(`${API_URL}/create-order`, { email });
};

const verifyPayment = (paymentData) => {
  return axios.post(`${API_URL}/verify-payment`, paymentData);
};

const paymentService = {
  createOrder,
  verifyPayment,
};

export default paymentService;
// client/src/services/paymentService.js
import axios from 'axios';

const API_URL = '/api/payments';

const createOrder = (token) => {
  const config = {
    headers: {
      'x-auth-token': token
    }
  };
  // The user's ID is sent via the auth token, so the body can be empty.
  return axios.post(`${API_URL}/create-order`, null, config);
};



const verifyPayment = (paymentData) => {
  return axios.post(`${API_URL}/verify-payment`, paymentData);
};

const paymentService = {
  createOrder,
  verifyPayment,
};

export default paymentService;
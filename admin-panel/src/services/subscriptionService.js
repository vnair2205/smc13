import axios from 'axios';


const API_URL = '/api/subscriptions';

const getAuthToken = () => localStorage.getItem('adminToken');

const getPlans = () => {
    return axios.get(API_URL, {
        headers: { 'x-auth-token': getAuthToken() }
    });
};

// 👇 This is the new function for the admin panel
const getAllPlans = () => {
    return axios.get(`${API_URL}/all`, {
        headers: { 'x-auth-token': getAuthToken() }
    });
};

const addPlan = (planData) => {
    return axios.post(API_URL, planData, {
        headers: { 'x-auth-token': getAuthToken() }
    });
};

const updatePlan = (id, planData) => {
    return axios.put(`${API_URL}/${id}`, planData, {
        headers: { 'x-auth-token': getAuthToken() }
    });
};

const deletePlan = (id) => {
    return axios.delete(`${API_URL}/${id}`, {
        headers: { 'x-auth-token': getAuthToken() }
    });
};

// 👇 FIX: Ensure getAllPlans is included in the exported object
const subscriptionService = {
    getPlans,
    getAllPlans,
    addPlan,
    updatePlan,
    deletePlan,
};

export default subscriptionService;
import api from '../utils/api';

const API_URL = '/admin/profile';

export const getProfileForAdmin = async (userId) => {
  const response = await api.get(`${API_URL}/${userId}`);
  return response.data;
};

export const updateProfileForAdmin = async (userId, profileData) => {
  const response = await api.put(`${API_URL}/${userId}`, profileData);
  return response.data;
};
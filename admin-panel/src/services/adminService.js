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


export const getUserById = async (userId) => {
    try {
        const res = await api.get(`/admin/users/${userId}`);
        return res.data;
    } catch (error) {
        console.error('Failed to fetch user by ID', error);
        throw error;
    }
};




export const getUserCourses = async (userId) => {
  try {
    const res = await api.get(`/admin/users/${userId}/courses`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch user courses', error);
    throw error;
  }
};
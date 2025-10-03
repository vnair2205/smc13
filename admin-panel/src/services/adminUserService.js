import api from '../utils/api';

export const getCourseForUser = async (userId, courseId) => {
  const response = await api.get(`/admin/users/${userId}/courses/${courseId}`);
  return response.data;
};

export const getChatForUserCourse = async (userId, courseId) => {
  const response = await api.get(`/admin/users/${userId}/courses/${courseId}/chat`);
  return response.data;
};
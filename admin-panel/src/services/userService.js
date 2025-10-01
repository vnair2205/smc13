import api from '../utils/api';

/**
 * Fetches a paginated and filtered list of all users.
 * This is used by the main UserManagementPage.
 */
export const getUsers = async (page = 1, limit = 10, searchTerm = '', statusFilter = '') => {
  try {
    const res = await api.get('/admin/users', {
      params: { page, limit, search: searchTerm, status: statusFilter }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch users', error);
    throw error;
  }
};

/**
 * Fetches statistics about users (total, active, inactive).
 * This is used by the main UserManagementPage.
 */
export const getUserStats = async () => {
  try {
    const res = await api.get('/admin/users/stats');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch user stats', error);
    throw error;
  }
};

/**
 * Fetches the complete details for a single user by their ID.
 */
export const getUserDetails = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user details', error);
    throw error;
  }
};

/**
 * Updates a user's details.
 */
export const updateUserDetails = async (userId, data) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update user details', error);
    throw error;
  }
};

/**
 * A specific update function for changing user status.
 * Note: This can be consolidated with updateUserDetails if the backend logic is the same.
 */
export const updateUserStatus = async (userId, data) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update user status', error);
    throw error;
  }
};

/**
 * Changes a user's subscription plan.
 */
export const changeUserPlan = async (userId, newPlanId) => {
  try {
    const response = await api.post('/admin/users/change-plan', { userId, newPlanId });
    return response.data;
  } catch (error) {
    console.error('Failed to change user plan', error);
    throw error;
  }
};

/**
 * Adds additional course credits to a user's account.
 */
export const addCourseCount = async (userId, additionalCourses) => {
  try {
    const response = await api.post('/admin/users/add-course-count', { userId, additionalCourses });
    return response.data;
  } catch (error) {
    console.error('Failed to add course count', error);
    throw error;
  }
};

/**
 * Fetches all courses associated with a specific user.
 */
export const getUserAllCourses = async (userId) => {
  try {
    const res = await api.get(`/admin/users/${userId}/courses`);
    return res.data;
  } catch (err) {
    console.error('Failed to fetch user courses', err);
    throw err;
  }
};

/**
 * Fetches a specific course for a specific user.
 */
export const getCourseForUser = async (userId, courseId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch course for user', error);
    throw error;
  }
};

/**
 * Fetches the chat history for a user within a specific course.
 */
export const getChatForUserCourse = async (userId, courseId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/courses/${courseId}/chat`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chat for user course', error);
    throw error;
  }
};
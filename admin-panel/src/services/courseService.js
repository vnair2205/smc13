import axios from 'axios';

const API_URL = '/api/admin/courses';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
        },
    };
};

export const getCourseDetails = async (courseId) => {
    const response = await axios.get(`${API_URL}/${courseId}`, getAuthHeaders());
    return response.data;
};


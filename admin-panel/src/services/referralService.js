import api from '../utils/api';

export const getAdminReferrals = async (page, limit, search) => {
  try {
    const res = await api.get('/referrals/admin', {
      params: { page, limit, search }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch admin referrals', error);
    throw error;
  }
};

export const createAdminReferral = async (referralData) => {
  try {
    const res = await api.post('/referrals/admin', referralData);
    return res.data;
  } catch (error) {
    console.error('Failed to create admin referral', error);
    throw error;
  }
};
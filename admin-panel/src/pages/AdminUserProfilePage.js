import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getProfileForAdmin, updateProfileForAdmin } from '../services/adminService'; // We will create this
import Preloader from '../components/common/Preloader';
import PersonalInfo from '../components/profile/PersonalInfo';
import Bio from '../components/profile/Bio';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.h1`
  margin-bottom: 2rem;
`;

const AdminUserProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfileForAdmin(userId);
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch user profile for admin", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (updatedData) => {
    try {
      const updatedProfile = await updateProfileForAdmin(userId, updatedData);
      setProfile(updatedProfile);
      // You can add a success notification here
    } catch (error) {
      console.error("Failed to update user profile for admin", error);
      // You can add an error notification here
    }
  };

  if (loading) return <Preloader />;
  if (!profile) return <PageContainer><h1>Profile not found.</h1></PageContainer>;

  return (
    <PageContainer>
      <Header>Editing Profile for {profile.firstName} {profile.lastName}</Header>
      <PersonalInfo profile={profile} onSave={handleSave} />
      <Bio profile={profile} onSave={handleSave} />
      {/* Add other profile components here as needed */}
    </PageContainer>
  );
};

export default AdminUserProfilePage;
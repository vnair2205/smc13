import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import PersonalInfo from '../../components/profile/PersonalInfo';
import LearnsProfile from '../../components/profile/LearnsProfile';
import Preloader from '../../components/common/Preloader';

const ProfilePageContainer = styled.div`
  padding: 2rem;
  color: white;
  display: flex;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const RightColumn = styled.div`
  flex: 2;
  width: 100%;
`;

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfileData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setLoading(true);
            const config = { headers: { 'x-auth-token': token } };
            const profileRes = await axios.get('/api/profile', config);
            setUser(profileRes.data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    if (loading) return <Preloader />;
    if (!user) return <ProfilePageContainer><h2>Could not load user profile.</h2></ProfilePageContainer>;

    return (
        <ProfilePageContainer>
            <LeftColumn>
                <PersonalInfo user={user} onUpdate={fetchProfileData} />
            </LeftColumn>
            <RightColumn>
                <LearnsProfile user={user} />
            </RightColumn>
        </ProfilePageContainer>
    );
};

export default ProfilePage;
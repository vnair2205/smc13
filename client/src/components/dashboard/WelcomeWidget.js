// client/src/components/dashboard/WelcomeWidget.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const WidgetContainer = styled.div`
  grid-column: span 2;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) {
    grid-column: span 1;
    padding: 1.5rem;
  }
`;

const WelcomeMessage = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 500;
  
  span {
    font-weight: 700;
  }
`;

const SubscriptionDetails = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #4a4a58;
  display: flex;
  justify-content: space-around;
  text-align: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }
`;

const DetailItem = styled.div`
  h4 {
    font-size: 0.9rem;
    color: #a0a0b0;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  p {
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const WelcomeWidget = () => {
  const { t } = useTranslation(); // Initialize t function
  const [userData, setUserData] = useState({
    firstName: '',
    planName: '',
    renewalDate: null,
    courseQuota: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWelcomeData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/dashboard/welcome-data', {
            headers: { 'x-auth-token': token }
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Failed to fetch user data for dashboard", error);
        setUserData({
            firstName: 'User',
            planName: 'Error',
            renewalDate: null,
            courseQuota: 'N/A'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWelcomeData();
  }, []);

  const formattedRenewalDate = userData.renewalDate 
    ? format(new Date(userData.renewalDate), 'dd MMM yyyy') 
    : 'N/A';

  return (
    <WidgetContainer>
      <WelcomeMessage>
        {t('dashboard.welcome_widget.welcome_back')} <span>{isLoading ? '...' : userData.firstName}</span>
      </WelcomeMessage>
      <SubscriptionDetails>
        <DetailItem>
          <h4>{t('dashboard.welcome_widget.current_plan')}</h4>
          <p>{isLoading ? '...' : userData.planName}</p>
        </DetailItem>
        <DetailItem>
          <h4>{t('dashboard.welcome_widget.next_renewal')}</h4>
          <p>{isLoading ? '...' : formattedRenewalDate}</p>
        </DetailItem>
        <DetailItem>
          <h4>{t('dashboard.welcome_widget.course_quota')}</h4>
          <p>{isLoading ? '...' : userData.courseQuota}</p>
        </DetailItem>
      </SubscriptionDetails>
    </WidgetContainer>
  );
};

export default WelcomeWidget;
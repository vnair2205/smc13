// client/src/components/dashboard/WelcomeWidget.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { format } from 'date-fns';

const WidgetContainer = styled.div`
  grid-column: span 2;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
`;

const DetailItem = styled.div`
  h4 {
    margin: 0 0 0.5rem 0;
    color: #a0aec0;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
  }
`;

const WelcomeWidget = () => {
  const [userData, setUserData] = useState({
    firstName: 'User',
    planName: 'N/A',
    renewalDate: null,
    courseQuota: '00/00'
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
        Welcome back, <span>{isLoading ? '...' : userData.firstName}</span>
      </WelcomeMessage>
      <SubscriptionDetails>
        <DetailItem>
          <h4>Current Plan</h4>
          <p>{isLoading ? '...' : userData.planName}</p>
        </DetailItem>
        <DetailItem>
          <h4>Next Renewal</h4>
          <p>{isLoading ? '...' : formattedRenewalDate}</p>
        </DetailItem>
        <DetailItem>
          <h4>Course Quota</h4>
          <p>{isLoading ? '...' : userData.courseQuota}</p>
        </DetailItem>
      </SubscriptionDetails>
    </WidgetContainer>
  );
};

export default WelcomeWidget;
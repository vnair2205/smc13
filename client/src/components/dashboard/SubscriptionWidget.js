// client/src/components/dashboard/SubscriptionWidget.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaCreditCard } from 'react-icons/fa';

const WidgetContainer = styled.div`
  grid-column: span 1;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
`;

const IconWrapper = styled.div`
    font-size: 3rem;
    color: #82ca9d;
    margin-bottom: 0.5rem;
`;

const ActionButton = styled(Link)`
  padding: 0.8rem 1.5rem;
  background-color: #4a5568;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2d3748;
  }
`;


const SubscriptionWidget = () => {
    return (
        <WidgetContainer>
            <IconWrapper><FaCreditCard /></IconWrapper>
            <h3>My Subscription</h3>
            <p>View your plan details and billing history.</p>
            {/* --- THIS IS THE FIX --- */}
            <ActionButton to="/subscription-history">View History</ActionButton>
        </WidgetContainer>
    );
};

export default SubscriptionWidget;
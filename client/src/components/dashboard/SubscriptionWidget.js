// client/src/components/dashboard/SubscriptionWidget.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const WidgetContainer = styled(Link)`
  grid-column: span 1;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
  text-decoration: none;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const SubscriptionWidget = () => {
  return (
    <WidgetContainer to="/plans">
      <h3>Subscription</h3>
      <p>Manage your plan and billing.</p>
    </WidgetContainer>
  );
};

export default SubscriptionWidget;
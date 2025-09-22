// client/src/components/dashboard/HelpSupportWidget.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiHelpCircle } from 'react-icons/fi';

const WidgetContainer = styled.div`
  grid-column: span 1;
  background-color: #33333d;
  border-radius: 12px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  height: 100%;
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  /* --- THIS IS THE FIX --- */
  color: #03d9c5;
`;

const HelpSupportWidget = () => {
  return (
    <WidgetContainer>
      <CardLink to="/support-tickets">
        <IconWrapper><FiHelpCircle /></IconWrapper>
        <h3>Help & Support</h3>
        <p style={{ textAlign: 'center' }}>Find answers or contact our team.</p>
      </CardLink>
    </WidgetContainer>
  );
};

export default HelpSupportWidget;
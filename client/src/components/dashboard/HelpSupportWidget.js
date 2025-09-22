// client/src/components/dashboard/HelpSupportWidget.js
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

const HelpSupportWidget = () => {
  return (
    <WidgetContainer to="/support">
      <h3>Help & Support</h3>
      <p>Contact us for assistance.</p>
    </WidgetContainer>
  );
};

export default HelpSupportWidget;
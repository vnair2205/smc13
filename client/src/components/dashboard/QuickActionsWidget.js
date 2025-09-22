// client/src/components/dashboard/QuickActionsWidget.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const WidgetContainer = styled.div`
  grid-column: span 1;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActionButton = styled(Link)`
  padding: 1rem;
  background-color: #5a67d8;
  color: white;
  text-align: center;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #434190;
  }
`;

const QuickActionsWidget = () => {
  return (
    <WidgetContainer>
      <ActionButton to="/generate-course">Generate New Course</ActionButton>
      <ActionButton to="/pre-generated-courses">Browse Pre-Generated Courses</ActionButton>
    </WidgetContainer>
  );
};

export default QuickActionsWidget;
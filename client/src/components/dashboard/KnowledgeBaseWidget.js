// client/src/components/dashboard/KnowledgeBaseWidget.js
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

const KnowledgeBaseWidget = () => {
  return (
    <WidgetContainer to="/knowledge-base">
      <h3>Knowledge Base</h3>
      <p>Find answers to your questions.</p>
    </WidgetContainer>
  );
};

export default KnowledgeBaseWidget;
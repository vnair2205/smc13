// client/src/components/dashboard/KnowledgeBaseWidget.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaBookReader } from 'react-icons/fa';

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

const KnowledgeBaseWidget = () => {
  return (
    <WidgetContainer>
      <CardLink to="/knowledge-base">
        <IconWrapper><FaBookReader /></IconWrapper>
        <h3>Knowledge Base</h3>
        <p style={{ textAlign: 'center' }}>Explore articles and tutorials.</p>
      </CardLink>
    </WidgetContainer>
  );
};

export default KnowledgeBaseWidget;
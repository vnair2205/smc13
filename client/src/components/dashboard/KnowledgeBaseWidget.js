// client/src/components/dashboard/KnowledgeBaseWidget.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaBookReader } from 'react-icons/fa';

const WidgetContainer = styled.div`
  background: #33333d;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 8px #33333d;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%; /* This is the fix */
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
// client/src/pages/dashboard/ExamPrepPage.js
import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const ExamPrepPage = () => {
  return (
    <PageContainer>
      <Title>Entrance Exam Prep</Title>
      <p>This feature is coming soon!</p>
    </PageContainer>
  );
};

export default ExamPrepPage;
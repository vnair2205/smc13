import React from 'react';
import styled from 'styled-components';

const ReportsContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const Card = styled.div`
  background-color: #1e1e2d;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const ReportsPage = () => {
  const reports = [
    'User Reports',
    'Subscription Report',
    'Pregenerated Course reports',
    'Renewal Report',
    'InActive Customers',
    'Courses reports',
    'Certificates',
    'Churn Customers',
  ];

  return (
    <ReportsContainer>
      <Title>Reports</Title>
      <CardsContainer>
        {reports.map((report, index) => (
          <Card key={index}>
            <CardTitle>{report}</CardTitle>
          </Card>
        ))}
      </CardsContainer>
    </ReportsContainer>
  );
};

export default ReportsPage;
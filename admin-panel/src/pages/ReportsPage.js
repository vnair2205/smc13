import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom'; // Keep this import

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

// Base styles for all cards. Now it's a simple div.
const CardBase = styled.div`
  background-color: #1e1e2d;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  color: #fff;
  text-decoration: none;
`;

// A clickable card that will be rendered as a Link
const Card = styled(CardBase)`
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.15);
  }
`;

// A non-clickable card
const DisabledCard = styled(CardBase)`
  cursor: not-allowed;
  opacity: 0.6;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const ComingSoonText = styled.p`
  font-size: 0.9rem;
  color: #a7a7a7;
  margin: 0;
`;

const ReportsPage = () => {
  const reportLinks = {
    'User Reports': '/reports/user',
    'Subscription Report': '/reports/subscription',
    'Pregenerated Course reports': '/reports/pregenerated', 
  'Courses reports': '/reports/courses',
  'Certificates': '/reports/certificates',
  'Churn Customers': '/reports/churn',
   'Dropped Customers': '/reports/dropped-customers',
  };

  const reports = [
    'User Reports',
    'Subscription Report',
    'Pregenerated Course reports',
    
   'Dropped Customers',
    'Courses reports',
    'Certificates',
    'Churn Customers',
  ];

  return (
    <ReportsContainer>
      <Title>Reports</Title>
      <CardsContainer>
        {reports.map((report, index) => {
          const path = reportLinks[report];

          if (path) {
            // --- THIS IS THE FIX ---
            // We use the 'as' prop to render our styled 'Card' component as a 'Link'
            return (
              <Card as={Link} to={path} key={index}>
                <CardTitle>{report}</CardTitle>
              </Card>
            );
            // ---------------------
          } else {
            return (
              <DisabledCard key={index}>
                <CardTitle>{report}</CardTitle>
                <ComingSoonText>(Coming Soon)</ComingSoonText>
              </DisabledCard>
            );
          }
        })}
      </CardsContainer>
    </ReportsContainer>
  );
};

export default ReportsPage;
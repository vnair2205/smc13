// client/src/pages/DashboardPage.js
import React from 'react';
import styled from 'styled-components';
import WelcomeWidget from '../components/dashboard/WelcomeWidget';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import ProgressWidget from '../components/dashboard/ProgressWidget';
import KnowledgeBaseWidget from '../components/dashboard/KnowledgeBaseWidget';
import SubscriptionWidget from '../components/dashboard/SubscriptionWidget';
import HelpSupportWidget from '../components/dashboard/HelpSupportWidget';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 1.5rem;
  padding: 1.5rem;
`;

const DashboardPage = () => {
  return (
    <DashboardGrid>
      <WelcomeWidget />
      <QuickActionsWidget />
      <ProgressWidget />
      <KnowledgeBaseWidget />
      <SubscriptionWidget />
      <HelpSupportWidget />
    </DashboardGrid>
  );
};

export default DashboardPage;
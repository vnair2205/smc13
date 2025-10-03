import React from 'react';
import styled from 'styled-components';
import WelcomeWidget from '../components/dashboard/WelcomeWidget';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import ProgressWidget from '../components/dashboard/ProgressWidget';
import KnowledgeBaseWidget from '../components/dashboard/KnowledgeBaseWidget';
import SubscriptionWidget from '../components/dashboard/SubscriptionWidget';
import HelpSupportWidget from '../components/dashboard/HelpSupportWidget';
import LanguageSwitcher from '../components/common/LanguageSwitcher'; // Import the component
import { useTranslation } from 'react-i18next';

// This is the new styled-component for the mobile-only language switcher
const MobileOnlyLanguageSwitcher = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: flex-end;
    padding: 0 1.5rem 1rem; // Add some padding to align it
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: auto;
  grid-template-areas:
    "welcome welcome quick-actions"
    "progress progress progress"
    "bottom-widgets bottom-widgets bottom-widgets";
  gap: 2rem;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: 0; // Remove top padding to avoid double spacing
    grid-template-columns: 1fr;
    grid-template-areas:
      "welcome"
      "quick-actions"
      "progress"
      "bottom-widgets";
  }
`;

const BottomWidgetsWrapper = styled.div`
  grid-area: bottom-widgets;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: stretch;

  & > div {
    height: 100%;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WelcomeWidgetContainer = styled.div`
  grid-area: welcome;
`;

const QuickActionsWidgetContainer = styled.div`
  grid-area: quick-actions;
`;

const ProgressWidgetContainer = styled.div`
  grid-area: progress;
`;

const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <MobileOnlyLanguageSwitcher>
        <LanguageSwitcher />
      </MobileOnlyLanguageSwitcher>

      <DashboardGrid>
        <WelcomeWidgetContainer>
          <WelcomeWidget />
        </WelcomeWidgetContainer>
        <QuickActionsWidgetContainer>
          <QuickActionsWidget />
        </QuickActionsWidgetContainer>
        <ProgressWidgetContainer>
          <ProgressWidget />
        </ProgressWidgetContainer>
        
        <BottomWidgetsWrapper>
          <div><KnowledgeBaseWidget /></div>
          <div><SubscriptionWidget /></div>
          <div><HelpSupportWidget /></div>
        </BottomWidgetsWrapper>
      </DashboardGrid>
    </>
  );
};

export default DashboardPage;
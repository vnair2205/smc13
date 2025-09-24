import React from 'react';
import styled from 'styled-components';
import WelcomeWidget from '../components/dashboard/WelcomeWidget';
import ProgressWidget from '../components/dashboard/ProgressWidget';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import SubscriptionWidget from '../components/dashboard/SubscriptionWidget';
import KnowledgeBaseWidget from '../components/dashboard/KnowledgeBaseWidget';
import HelpSupportWidget from '../components/dashboard/HelpSupportWidget';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

// This container will make the language switcher visible only on mobile.
const MobileOnlyLanguageSwitcher = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: flex-end;
    padding: 0 1.5rem; /* Align with grid padding */
    margin-bottom: 1rem;
  }
`;

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
`;

const DashboardPage = () => {
    const { t } = useTranslation();

    return (
        <div>
            {/* This will now appear on mobile screens above the welcome text */}
            <MobileOnlyLanguageSwitcher>
                <LanguageSwitcher />
            </MobileOnlyLanguageSwitcher>

            <DashboardGrid>
                <WelcomeWidget />
                <ProgressWidget />
                <QuickActionsWidget />
                <SubscriptionWidget />
                <KnowledgeBaseWidget />
                <HelpSupportWidget />
            </DashboardGrid>
        </div>
    );
};

export default DashboardPage;
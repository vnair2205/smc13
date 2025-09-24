import React, { useState, useEffect, createContext, useContext } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import RenewModal from '../subscriptions/RenewModal';
import UpgradeModal from '../subscriptions/UpgradeModal';
import Preloader from '../common/Preloader';
import api from '../../utils/api';
import BottomNav from './BottomNav';

const DashboardContext = createContext(null);
export const useDashboard = () => useContext(DashboardContext);


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
    /* Create a 3-column grid on larger screens */
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;

    /* Switch to a single-column layout on smaller screens */
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
`;
const LayoutContainer = styled.div`
  display: flex;
  background-color: #27293d;
  /* This now controls the entire layout's direction */
  direction: ${({ $isRTL }) => ($isRTL ? 'rtl' : 'ltr')};
`;

const GridItem = styled.div`
  /* Define how many columns an item should span on desktop */
  ${({ $desktopSpan }) => $desktopSpan && `grid-column: span ${$desktopSpan};`}

  /* On smaller screens, all items will span the full single column */
  @media (max-width: 992px) {
    grid-column: span 1;
  }
`;

const expandedWidth = '300px';
const collapsedWidth = '88px';

const DesktopSidebar = styled(Sidebar)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ContentContainer = styled.main`
  flex-grow: 1;
  /* The margin logic now correctly uses the $isRTL prop */
  margin-left: ${({ $isCollapsed, $isRTL }) => ($isRTL ? '0' : ($isCollapsed ? collapsedWidth : expandedWidth))};
  margin-right: ${({ $isCollapsed, $isRTL }) => ($isRTL ? ($isCollapsed ? collapsedWidth : expandedWidth) : '0')};
  padding: 2rem;
  padding-top: 100px;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out, margin-right 0.3s ease-in-out;

  @media (max-width: 768px) {
    margin-left: 0;
    margin-right: 0;
    padding: 1rem;
    padding-top: 100px;
    padding-bottom: 80px;
  }
`;

const DashboardLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { i18n } = useTranslation();
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [subscriptionState, setSubscriptionState] = useState({
        isActive: false,
        isLoading: true,
    });

    // 1. Add state to reliably track the RTL status
    const [isRTL, setIsRTL] = useState(i18n.dir() === 'rtl');

    // 2. This effect now directly depends on language changes, forcing an update
    useEffect(() => {
        setIsRTL(i18n.dir() === 'rtl');
    }, [i18n, i18n.language]); // The key is adding i18n.language here

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data } = await api.get('/subscriptions/status');
                setSubscriptionState({ isActive: data.isActive, isLoading: false });
            } catch (error) {
                console.error("Failed to fetch subscription status", error);
                setSubscriptionState({ isActive: false, isLoading: false });
            }
        };
        checkStatus();
    }, []);

    const handleRenewRequest = () => {
        setIsRenewModalOpen(true);
    };

    const handleRenewConfirm = () => {
        setIsRenewModalOpen(false);
        setIsUpgradeModalOpen(true);
    };

    const handleUpgradeSuccess = async () => {
        setIsUpgradeModalOpen(false);
        setSubscriptionState({ ...subscriptionState, isLoading: true });
        try {
            const { data } = await api.get('/subscriptions/status');
            setSubscriptionState({ isActive: data.isActive, isLoading: false });
        } catch (error) {
            console.error("Failed to re-fetch subscription status", error);
            setSubscriptionState({ isActive: false, isLoading: false });
        }
    };

    if (subscriptionState.isLoading) {
        return <Preloader />;
    }

    const contextValue = {
        isSubscribed: subscriptionState.isActive,
        handleRenewRequest,
    };
    
    return (
        <DashboardContext.Provider value={contextValue}>
            {/* 3. Pass the reliable isRTL state to the layout components */}
            <LayoutContainer $isRTL={isRTL}>
                <Header isCollapsed={isCollapsed} />
                <DesktopSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isRTL={isRTL} />
                
                <ContentContainer $isCollapsed={isCollapsed} $isRTL={isRTL}>
                    <Outlet />
                </ContentContainer>
                <BottomNav />

                <RenewModal
                    isOpen={isRenewModalOpen}
                    onClose={() => setIsRenewModalOpen(false)}
                    onRenew={handleRenewConfirm}
                />
                <UpgradeModal
                    isOpen={isUpgradeModalOpen}
                    onClose={() => setIsUpgradeModalOpen(false)}
                    onUpgradeSuccess={handleUpgradeSuccess}
                />
            </LayoutContainer>
        </DashboardContext.Provider>
    );
};

export default DashboardLayout;
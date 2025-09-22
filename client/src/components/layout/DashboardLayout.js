import React, { useState, useEffect, createContext, useContext } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
// --- FIX: Corrected the typo from 'react-i_next' to 'react-i18next' ---
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import RenewModal from '../subscriptions/RenewModal';
import UpgradeModal from '../subscriptions/UpgradeModal';
import Preloader from '../common/Preloader';
import api from '../../utils/api';

const DashboardContext = createContext(null);
export const useDashboard = () => useContext(DashboardContext);

const LayoutContainer = styled.div`
  display: flex;
  background-color: #27293d; 
`;

const expandedWidth = '300px';
const collapsedWidth = '88px';

const ContentContainer = styled.main`
  flex-grow: 1;
  margin-left: ${({ $isCollapsed, $dir }) => ($dir === 'rtl' ? '0' : ($isCollapsed ? collapsedWidth : expandedWidth))};
  margin-right: ${({ $isCollapsed, $dir }) => ($dir === 'rtl' ? ($isCollapsed ? collapsedWidth : expandedWidth) : '0')};
  padding: 2rem;
  padding-top: 100px;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out, margin-right 0.3s ease-in-out;
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
            <LayoutContainer>
                <Header isCollapsed={isCollapsed} />
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <ContentContainer $isCollapsed={isCollapsed} $dir={i18n.dir()}>
                    <Outlet />
                </ContentContainer>

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
import React, { useState, useEffect, createContext, useContext } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../../utils/api';
import RenewModal from '../subscriptions/RenewModal';
import UpgradeModal from '../subscriptions/UpgradeModal';

// Context to provide user data and modal controls to children (like Sidebar)
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
    
    // --- NEW STATE MANAGEMENT ---
    const [userProfile, setUserProfile] = useState(null);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const fetchUserProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setUserProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleRenewRequest = () => {
        setIsRenewModalOpen(true);
    };

    const handleRenewConfirm = () => {
        setIsRenewModalOpen(false);
        setIsUpgradeModalOpen(true);
    };
    
    const handleUpgradeSuccess = () => {
        fetchUserProfile(); // Refetch profile to update status
        setIsUpgradeModalOpen(false);
    };
    
    // --- PROVIDE DATA AND FUNCTIONS VIA CONTEXT ---
    const contextValue = {
        userProfile,
        handleRenewRequest
    };

    return (
        <DashboardContext.Provider value={contextValue}>
            <LayoutContainer>
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <Header isCollapsed={isCollapsed} />
                <ContentContainer $isCollapsed={isCollapsed} $dir={i18n.dir()}>
                    <Outlet />
                </ContentContainer>
                
                {/* RENDER MODALS HERE */}
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
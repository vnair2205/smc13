// client/src/components/layout/Sidebar.js
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
    FiGrid, FiEdit, FiFolder, FiAward, FiUsers, FiHelpCircle, FiMessageSquare, FiCalendar, FiBookOpen,
    FiBell, FiUser, FiFileText, FiShield, FiLogOut, FiTrash2, FiClock, FiChevronsLeft, FiChevronsRight,
    FiClipboard, FiChevronDown // --- 1. IMPORT NEW ICON ---
} from 'react-icons/fi';
import logo from '../../assets/seekmycourse_logo.png';
import { Modal, ModalText, ModalButtonContainer, ModalButton } from '../common/Modal';

const expandedWidth = '300px';
const collapsedWidth = '88px';

// Use $isCollapsed for transient prop
const SidebarContainer = styled.div`
  width: ${({ $isCollapsed }) => ($isCollapsed ? collapsedWidth : expandedWidth)};
  background-color: #1e1e2d;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  ${({ dir }) => (dir === 'rtl' ? 'right: 0;' : 'left: 0;')}
  transition: width 0.3s ease-in-out;
  z-index: 100;
`;

const MenuItemButton = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #a0a0a0;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  svg {
    font-size: 1.5rem;
    min-width: 2rem;
    text-align: center;
  }

  &:hover {
    background-color: #2a2a3e;
    color: #fff;
  }
`;
const SubMenu = styled.ul`
  list-style: none;
  padding-left: 2.5rem; /* Indent sub-menu items */
  margin: 0;
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
`;

const ChevronIcon = styled(FiChevronDown)`
  margin-left: auto;
  transition: transform 0.3s ease-in-out;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  display: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : 'block')};
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'space-between')};
  padding: 1.5rem;
  height: 80px;
`;

const Logo = styled.img`
  width: 160px;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
`;

const CollapseButton = styled.button`
  background: transparent;
  border: none;
  color: #8e8e93;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover { background: #555; }
`;

const MenuItem = styled.li`
  margin: 0.5rem 0;
`;

const MenuText = styled.span`
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : 'auto')};
  white-space: nowrap;
  transition: opacity 0.2s ease-in-out, width 0.2s ease-in-out;
  overflow: hidden;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.9rem 1.75rem;
  margin: 0 0.75rem;
  color: #8e8e93;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  ${({ $isCollapsed }) => $isCollapsed && css`
    justify-content: center;
    padding: 1rem 0;
    &.active {
      padding-left: 0;
    }
  `}

  ${({ $variant }) => $variant === 'danger' && css`
    background-color: #d95c03;
    color: white;
    &:hover { background-color: #b84d03; }
  `}
  ${({ $variant }) => $variant === 'light' && css`
    background-color: white;
    color: #1e1e2d;
    &:hover { background-color: #f0f0f0; }
  `}

  ${({ $variant }) => !$variant && css`
    &:hover {
      background-color: #2a2a3e;
      color: white;
    }
  `}

  &.active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #1e1e2d; 
    font-weight: 600;
  }

  svg {
    font-size: 1.5rem;
    min-width: 24px;
    margin-right: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1.25rem')};
    transition: margin-right 0.3s ease-in-out;
  }
`;

const Separator = styled.hr`
  border: none;
  border-top: 1px solid #444;
  margin: 1rem 1.5rem;
`;


const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
     const [isHelpMenuOpen, setHelpMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/auth/logout', {}, {
                headers: { 'x-auth-token': token }
            });
        } catch (error) {
            console.error("Logout failed, proceeding to clear client-side session.", error);
        } finally {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const handleDeleteAccount = () => {
        alert(t('errors.delete_confirm'));
    };

    const menuItems = [
        { path: "/dashboard", icon: <FiGrid />, nameKey: "sidebar.dashboard" },
        { path: "/generate-course", icon: <FiEdit />, nameKey: "sidebar.generate_course" },
        { path: "/pre-generated", icon: <FiFolder />, nameKey: "sidebar.pre_generated_courses" },
        { path: "/my-courses", icon: <FiBookOpen />, nameKey: "sidebar.my_courses" },
        { path: "/my-certificates", icon: <FiAward />, nameKey: "sidebar.my_certificates" },
        // { path: "/my-study-groups", icon: <FiUsers />, nameKey: "sidebar.my_study_groups" },
       
        { type: 'separator' },
          { path: "/help-support", nameKey: "sidebar.help_support", icon: <FiHelpCircle /> },
        // { path: "/seek-connect", icon: <FiMessageSquare />, nameKey: "sidebar.seek_connect" },
        // { path: "/events", icon: <FiCalendar />, nameKey: "sidebar.events" },
        { path: "/blogs", icon: <FiBookOpen />, nameKey: "sidebar.blogs" },
        { path: "/notifications", icon: <FiBell />, nameKey: "sidebar.notifications" },
        { path: "/profile", icon: <FiUser />, nameKey: "sidebar.profile" },
        { path: "/subscription-history", icon: <FiClock />, nameKey: "sidebar.subscription_history" },
        { type: 'separator' },
        { path: "/terms-of-service", icon: <FiFileText />, nameKey: "sidebar.terms" },
        { path: "/privacy-policy", icon: <FiShield />, nameKey: "sidebar.privacy" },
        { action: handleLogoutClick, icon: <FiLogOut />, nameKey: "sidebar.logout", variant: 'light' },
        { action: handleDeleteAccount, icon: <FiTrash2 />, nameKey: "sidebar.delete_account", variant: 'danger' },
        // { path: "/knowledge-base", nameKey: "sidebar.knowledge_base", icon: <FiBookOpen /> },
    ];

    return (
        <>
            <Modal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                title={t('errors.logout_confirm_title')}
            >
                <ModalText>{t('errors.logout_confirm_text')}</ModalText>
                <ModalButtonContainer>
                    <ModalButton onClick={() => setShowLogoutConfirm(false)}>{t('errors.cancel_button')}</ModalButton>
                    <ModalButton primary onClick={confirmLogout}>{t('errors.logout_button')}</ModalButton>
                </ModalButtonContainer>
            </Modal>

             <SidebarContainer $isCollapsed={isCollapsed} dir={document.body.dir}>
                <TopSection $isCollapsed={isCollapsed}>
                    {!isCollapsed && <Logo src={logo} alt="SeekMyCourse Logo" />}
                </TopSection>

                <MenuList>
                    {/* --- 4. UPDATE THE RENDERING LOGIC --- */}
                    {menuItems.map((item, index) => {
                        if (item.type === 'separator') {
                            return <Separator key={`sep-${index}`} />;
                        }

                        // --- Special handling for Help & Support item ---
                        if (item.nameKey === 'sidebar.help_support') {
                            return (
                                <React.Fragment key={item.nameKey}>
                                    <MenuItem>
                                        <MenuItemButton onClick={() => setHelpMenuOpen(!isHelpMenuOpen)}>
                                            {item.icon}
                                            <MenuText $isCollapsed={isCollapsed}>{t(item.nameKey)}</MenuText>
                                            <ChevronIcon $isOpen={isHelpMenuOpen} $isCollapsed={isCollapsed} />
                                        </MenuItemButton>
                                    </MenuItem>
                                    
                                    {isHelpMenuOpen && !isCollapsed && (
                                        <SubMenu>
                                          <MenuItem>
        <StyledNavLink to="/knowledge-base">
            <MenuText>Knowledge Base</MenuText>
        </StyledNavLink>
    </MenuItem>
    <MenuItem>
        <StyledNavLink to="/support-tickets">
            <MenuText>Support Tickets</MenuText>
        </StyledNavLink>
    </MenuItem>
                                        </SubMenu>
                                    )}
                                </React.Fragment>
                            );
                        }

                        // --- Default rendering for all other items ---
                        return (
                            <MenuItem key={item.nameKey}>
                                <StyledNavLink 
                                    to={item.path} 
                                    $isCollapsed={isCollapsed}
                                >
                                    {item.icon}
                                    <MenuText $isCollapsed={isCollapsed}>{t(item.nameKey)}</MenuText>
                                </StyledNavLink>
                            </MenuItem>
                        );
                    })}
                </MenuList>
                <CollapseButton dir={document.body.dir} onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
                </CollapseButton>
            </SidebarContainer>
        </>
    );
};

export default Sidebar;
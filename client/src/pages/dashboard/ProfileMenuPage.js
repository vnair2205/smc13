import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FiFolder, FiAward, FiBookOpen, FiClock, FiFileText, FiShield, FiLogOut, FiUser
} from 'react-icons/fi';

const PageContainer = styled.div`
  padding: 1.5rem;
  padding-bottom: 80px; // Space for the bottom nav
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1.5rem;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #2a2a38;
  border-radius: 12px;
  overflow: hidden;
`;

const MenuItemLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  color: #a0a0a0;
  text-decoration: none;
  border-bottom: 1px solid #3c3c4c;
  font-size: 1.1rem;

  svg {
    margin-right: 1.5rem;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    background-color: #3c3c4c;
    color: white;
  }
`;

const LogoutButton = styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1.25rem 1.5rem;
    color: #a0a0a0;
    background: none;
    border: none;
    text-align: left;
    font-size: 1.1rem;
    cursor: pointer;

    svg {
      margin-right: 1.5rem;
      font-size: 1.5rem;
      color: ${({ theme }) => theme.colors.primary};
    }

    &:hover {
      background-color: #3c3c4c;
      color: white;
    }
`;

const ProfileMenuPage = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
        } finally {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const menuItems = [
        { path: "/profile", icon: <FiUser />, name: "My Profile" },
        { path: "/pre-generated", icon: <FiFolder />, name: "Pre-Generated Courses" },
        { path: "/my-courses", icon: <FiBookOpen />, name: "My Courses" },
        { path: "/my-certificates", icon: <FiAward />, name: "My Certificates" },
        { path: "/subscription-history", icon: <FiClock />, name: "Subscription History" },
        { path: "/terms-of-service", icon: <FiFileText />, name: "Terms of Service" },
        { path: "/privacy-policy", icon: <FiShield />, name: "Privacy Policy" },
    ];

    return (
        <PageContainer>
            <Title>Profile & More</Title>
            <MenuList>
                {menuItems.map(item => (
                    <li key={item.path}>
                        <MenuItemLink to={item.path}>
                            {item.icon}
                            <span>{item.name}</span>
                        </MenuItemLink>
                    </li>
                ))}
                <li>
                    <LogoutButton onClick={handleLogout}>
                        <FiLogOut />
                        <span>Logout</span>
                    </LogoutButton>
                </li>
            </MenuList>
        </PageContainer>
    );
};

export default ProfileMenuPage;
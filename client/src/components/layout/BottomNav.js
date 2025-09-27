import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiEdit, FiUser } from 'react-icons/fi';

const NavContainer = styled.nav`
  display: none; // Hidden by default
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background-color: #1e1e2d;
  border-top: 1px solid #444;
  z-index: 1000;

  @media (max-width: 768px) {
    display: flex; // Shows on mobile
    justify-content: space-around;
    align-items: center;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  color: #8e8e93;
  text-decoration: none;
  font-size: 0.75rem;
  height: 100%;

  svg {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const BottomNav = () => {
  return (
    <NavContainer>
      <NavItem to="/dashboard">
        <FiGrid />
        Dashboard
      </NavItem>
      <NavItem to="/generate-course">
        <FiEdit />
        Generate
      </NavItem>
      <NavItem to="/profile-menu">
        <FiUser />
        Profile
      </NavItem>
    </NavContainer>
  );
};

export default BottomNav;
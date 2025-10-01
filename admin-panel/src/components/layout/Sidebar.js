import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiLogOut, FiBookOpen, FiChevronDown, FiChevronUp,
  FiMessageSquare, FiUsers as FiTeam, FiFileText, FiFile, FiCreditCard, FiShare2
} from 'react-icons/fi';
import logo from '../../assets/seekmycourse_logo.png';
import { FaBook } from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: 340px;
  background-color: #1e1e2d;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  transition: width 0.3s ease-in-out;
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  padding: 2rem 1.5rem;
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 2rem;
  flex-grow: 1;
  overflow-y: auto; /* This enables vertical scrolling */

  /* Custom scrollbar styling for a better look */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #1e1e2d;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 4px;
    border: 2px solid #1e1e2d;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #777;
  }
`;

const MenuItem = styled.li`
  margin: 0;
`;

const SubMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  color: #a0a0a0;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  svg {
    margin-right: 1.5rem;
    font-size: 1.5rem;
    min-width: 24px;
  }
  
  &:hover {
    color: #fff;
    background-color: #27273a;
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #a0a0a0;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease-in-out;

  svg {
    margin-right: 1.5rem;
    font-size: 1.5rem;
    min-width: 24px;
  }

  &:hover {
    color: #fff;
    background-color: #27273a;
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background-color: #27273a;
    border-right: 3px solid ${({ theme }) => theme.colors.primary};
  }
`;

const SubMenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #27273a;
  overflow: hidden;
  max-height: ${props => (props.$isOpen ? '300px' : '0')};
  transition: max-height 0.3s ease-in-out;
`;

const SubMenuLink = styled(StyledNavLink)`
  padding-left: 4.5rem;
  font-size: 0.95rem;
  
  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background-color: #1e1e2d;
    border: none;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #a0a0a0;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  
  svg {
    margin-right: 1.5rem;
    font-size: 1.5rem;
  }

  &:hover {
    color: #fff;
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const [isCoursesMenuOpen, setCoursesMenuOpen] = useState(false);
  const [isInstitutionalUsersMenuOpen, setInstitutionalUsersMenuOpen] = useState(false);
  const [isReferralsMenuOpen, setReferralsMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <SidebarContainer>
        <TopSection>
            <Logo src={logo} alt="Logo" />
        </TopSection>
        
        <MenuList>
            <MenuItem>
                <StyledNavLink to="/">
                    <FiGrid />
                    <span>Dashboard</span>
                </StyledNavLink>
            </MenuItem>
            <MenuItem>
                <StyledNavLink to="/user-management">
                    <FiUsers />
                    <span>User Management</span>
                </StyledNavLink>
            </MenuItem>

            <MenuItem>
                <SubMenuHeader onClick={() => setInstitutionalUsersMenuOpen(!isInstitutionalUsersMenuOpen)}>
                    <div>
                        <FiTeam />
                        <span>Institutional Users</span>
                    </div>
                    {isInstitutionalUsersMenuOpen ? <FiChevronUp /> : <FiChevronDown />}
                </SubMenuHeader>
                <SubMenuList $isOpen={isInstitutionalUsersMenuOpen}>
                    <li>
                        <SubMenuLink to="/institutional-user-management">User Management</SubMenuLink>
                    </li>
                    <li>
                        <SubMenuLink to="/institutional-subscription-plans">Subscription Plans</SubMenuLink>
                    </li>
                </SubMenuList>
            </MenuItem>

            <MenuItem>
                <SubMenuHeader onClick={() => setCoursesMenuOpen(!isCoursesMenuOpen)}>
                    <div>
                        <FiBookOpen />
                        <span>Pre-Generated Courses</span>
                    </div>
                    {isCoursesMenuOpen ? <FiChevronUp /> : <FiChevronDown />}
                </SubMenuHeader>
                <SubMenuList $isOpen={isCoursesMenuOpen}>
                    <li>
                        <SubMenuLink to="/category-management">Category Management</SubMenuLink>
                    </li>
                    <li>
                        <SubMenuLink to="/generate-course">Generate Course</SubMenuLink>
                    </li>
                    <li>
                        <SubMenuLink to="/generated-courses">Generated Courses</SubMenuLink>
                    </li>
                </SubMenuList>
            </MenuItem>
            <StyledNavLink to="/user-generated-courses">
              <FaBook />
                <span>User Generated Courses</span>
              </StyledNavLink>

            <MenuItem>
                <StyledNavLink to="/knowledgebase">
                    <FiBookOpen />
                    <span>Knowledgebase</span>
                </StyledNavLink>
            </MenuItem>
            <MenuItem>
                <StyledNavLink to="/support-tickets">
                    <FiMessageSquare />
                    <span>Support Tickets</span>
                </StyledNavLink>
            </MenuItem>
            <MenuItem>
                <StyledNavLink to="/blogs">
                    <FiFileText />
                    <span>Blogs & Tips</span>
                </StyledNavLink>
            </MenuItem>
             <MenuItem>
                <StyledNavLink to="/subscription-plans">
                    <FiCreditCard />
                    <span>Subscription Plans</span>
                </StyledNavLink>
            </MenuItem>

             <MenuItem>
                <SubMenuHeader onClick={() => setReferralsMenuOpen(!isReferralsMenuOpen)}>
                    <div>
                        <FiShare2 />
                        <span>Referrals</span>
                    </div>
                    {isReferralsMenuOpen ? <FiChevronUp /> : <FiChevronDown />}
                </SubMenuHeader>
                <SubMenuList $isOpen={isReferralsMenuOpen}>
                    <li>
                        <SubMenuLink to="/referrals/admin">Admin Referrals</SubMenuLink>
                    </li>
                    <li>
                        <SubMenuLink to="/referrals/user">User Referrals</SubMenuLink>
                    </li>
                </SubMenuList>
            </MenuItem>
            <MenuItem>
            <StyledNavLink to="/team">
                <FiTeam />
                <span>Team</span>
            </StyledNavLink>
            
        </MenuItem>
       <MenuItem>
          <StyledNavLink to="/terms">
            <FiFile />
            <span>Terms</span>
          </StyledNavLink>
        </MenuItem>

        </MenuList>

        <div style={{ marginTop: 'auto', marginBottom: '1rem' }}>
          <LogoutButton onClick={logout}>
            <FiLogOut />
            <span>Logout</span>
          </LogoutButton>
        </div>
    </SidebarContainer>
  );
};

export default Sidebar;
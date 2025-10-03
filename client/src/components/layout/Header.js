import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';

const expandedWidth = '300px';
const collapsedWidth = '88px';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  height: 80px;
  z-index: 50;
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  transition: left 0.3s ease-in-out, right 0.3s ease-in-out;

  /* Logic to handle positioning for both LTR and RTL directions */
  left: ${({ $isCollapsed, $dir }) => 
    $dir === 'rtl' ? '0' : ($isCollapsed ? collapsedWidth : expandedWidth)};
  
  right: ${({ $isCollapsed, $dir }) => 
    $dir === 'rtl' ? ($isCollapsed ? collapsedWidth : expandedWidth) : '0'};

  /* Aligns the items inside the header (the switcher) */
  justify-content: flex-end;
`;

const HeaderSwitcherWrapper = styled.div`
  /* Hides the language switcher on mobile devices, since it appears elsewhere */
  @media (max-width: 768px) {
    display: none;
  }
`;

const Header = ({ isCollapsed }) => {
    const { i18n } = useTranslation();

    return (
        <HeaderContainer $isCollapsed={isCollapsed} $dir={i18n.dir()}>
            <HeaderSwitcherWrapper>
               <LanguageSwitcher variant="header" />
            </HeaderSwitcherWrapper>
        </HeaderContainer>
    );
};

export default Header;
import React, { useState } from 'react';
import styled from 'styled-components';
import AllPreGenCoursesTab from '../../components/pre-generated/AllPreGenCoursesTab';
import MyPreGenCoursesTab from '../../components/pre-generated/MyPreGenCoursesTab';

// --- STYLES COPIED FROM MyCoursesPage.js ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  background-color: #1e1e2d;
  padding: 0.5rem;
  border-radius: 8px;
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: ${({ isActive, theme }) => (isActive ? theme.colors.primary : 'transparent')};
  color: ${({ isActive, theme }) => (isActive ? '#000' : theme.colors.textSecondary)};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
`;


const PreGeneratedPage = () => {
    const [activeTab, setActiveTab] = useState('all');

    return (
       <PageContainer>
            <HeaderContainer>
                <h1>Pre-Generated Courses</h1>
            </HeaderContainer>
            
            {/* --- FIX: Directly render the course list, removing all tab logic --- */}
            <AllPreGenCoursesTab />
            
        </PageContainer>
    );
};

export default PreGeneratedPage;
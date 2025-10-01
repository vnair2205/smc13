// admin-panel/src/pages/TeamPage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import DepartmentManager from '../components/team/DepartmentManager';
import DesignationManager from '../components/team/DesignationManager';
import TeamMemberManager from '../components/team/TeamMemberManager';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #2a2a3e;
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ isActive, theme }) => (isActive ? theme.colors.primary : theme.colors.textSecondary)};
  border-bottom: 2px solid ${({ isActive, theme }) => (isActive ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
`;

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState('department');

  return (
    <PageContainer>
      <Header>
        <h1>Team Management</h1>
      </Header>
      <TabContainer>
        <TabButton isActive={activeTab === 'department'} onClick={() => setActiveTab('department')}>
          Department
        </TabButton>
        <TabButton isActive={activeTab === 'designation'} onClick={() => setActiveTab('designation')}>
          Designation
        </TabButton>
        <TabButton isActive={activeTab === 'members'} onClick={() => setActiveTab('members')}>
          Team Members
        </TabButton>
      </TabContainer>
      <div>
        {activeTab === 'department' && <DepartmentManager />}
        {activeTab === 'designation' && <DesignationManager />}
        {activeTab === 'members' && <TeamMemberManager />}
      </div>
    </PageContainer>
  );
};

export default TeamPage;
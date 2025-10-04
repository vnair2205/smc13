import React from 'react';
import UserEngagementReports from '../components/dashboard/reports/UserEngagementReports';
import CourseContentReports from '../components/dashboard/reports/CourseContentReports';
import FinancialReports from '../components/dashboard/reports/FinancialReports';
import PlatformHealthReports from '../components/dashboard/reports/PlatformHealthReports';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 20px;
`;

const DashboardPage = () => {
  return (
    <DashboardContainer>
      <h1>Dashboard</h1>
      <p>Welcome to the SeekMYCOURSE Admin Panel.</p>
      
      <UserEngagementReports />
      <CourseContentReports />
      <FinancialReports />
      <PlatformHealthReports />
    </DashboardContainer>
  );
};

export default DashboardPage;
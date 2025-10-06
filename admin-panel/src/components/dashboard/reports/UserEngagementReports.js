import React from 'react';
import styled from 'styled-components';
import UserGrowthChart from '../charts/UserGrowthChart';

const ReportSection = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
`;

const UserEngagementReports = () => {
  return (
    <ReportSection>
      <SectionTitle>User and Engagement Reports</SectionTitle>
      
      <h4>User Growth</h4>
      <UserGrowthChart />

      {/* Placeholders for other reports */}
      <h4>Active Users (DAU/MAU)</h4>
      <p>Coming soon...</p>

      <h4>Geographic Distribution</h4>
      <p>Coming soon...</p>

      <h4>Top Engaged Users</h4>
      <p>Coming soon...</p>
    </ReportSection>
  );
};

export default UserEngagementReports;
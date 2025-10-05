import React from 'react';
import styled from 'styled-components';
import SupportTicketVolumeChart from '../charts/SupportTicketVolumeChart';

const ReportSection = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const MetricCard = styled.div`
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PlatformHealthReports = () => {
  return (
    <ReportSection>
      <SectionTitle>Platform Health and Support Reports</SectionTitle>
      
      <h4>Support Ticket Volume</h4>
      <SupportTicketVolumeChart />

      <MetricsContainer>
        <MetricCard>
          <h4>Average Ticket Resolution Time</h4>
          <p>Coming soon...</p>
        </MetricCard>
        <MetricCard>
          <h4>Knowledgebase Analytics</h4>
          <p>Coming soon...</p>
        </MetricCard>
      </MetricsContainer>
    </ReportSection>
  );
};

export default PlatformHealthReports;
import React from 'react';
import styled from 'styled-components';
import MrrChart from '../charts/MrrChart';
import PlanPerformanceChart from '../charts/PlanPerformanceChart';

const ReportSection = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FinancialReports = () => {
  return (
    <ReportSection>
      <SectionTitle>Financial and Revenue Reports</SectionTitle>
      
      <ChartsContainer>
        <div>
          <h4>Monthly Recurring Revenue (MRR)</h4>
          <MrrChart />
        </div>
        <div>
          <h4>Subscription Plan Performance</h4>
          <PlanPerformanceChart />
        </div>
      </ChartsContainer>

      <h4>Revenue by Referrer</h4>
      <p>Coming soon...</p>
    </ReportSection>
  );
};

export default FinancialReports;
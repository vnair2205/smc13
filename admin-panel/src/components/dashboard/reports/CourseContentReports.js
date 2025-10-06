import React from 'react';
import styled from 'styled-components';
import CourseGenerationChart from '../charts/CourseGenerationChart';
import CourseTypeChart from '../charts/CourseTypeChart';

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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const CourseContentReports = () => {
  return (
    <ReportSection>
      <SectionTitle>Course and Content Reports</SectionTitle>
      
      <h4>Course Generation Trends</h4>
      <CourseGenerationChart />

      <ChartsContainer>
        <div>
          <h4>Pre-generated vs. Custom Courses</h4>
          <CourseTypeChart />
        </div>
        <div>
          <h4>Most Popular Topics</h4>
          <p>Coming soon...</p>

          <h4>Course Completion Rate</h4>
          <p>Coming soon...</p>
        </div>
      </ChartsContainer>
    </ReportSection>
  );
};

export default CourseContentReports;
// client/src/components/dashboard/ProgressWidget.js
import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const WidgetContainer = styled.div`
  grid-column: span 3;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
`;

const data = [
  { name: 'In Progress', value: 5 },
  { name: 'Completed', value: 8 },
  { name: 'Certificates', value: 3 },
];

const ProgressWidget = () => {
  return (
    <WidgetContainer>
      <h3>My Progress At-a-Glance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#8884d8" />
          <YAxis />
          <Tooltip wrapperStyle={{ backgroundColor: '#333' }} />
          <Bar dataKey="value" fill="#8884d8" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </WidgetContainer>
  );
};

export default ProgressWidget;
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data. Replace this with data from your API.
const data = [
  { name: 'Basic Plan', value: 450 },
  { name: 'Pro Plan', value: 250 },
  { name: 'Enterprise Plan', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const PlanPerformanceChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PlanPerformanceChart;
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data. Replace this with data from your API.
const data = [
  { name: 'Mon', technical: 10, billing: 5, general: 8 },
  { name: 'Tue', technical: 12, billing: 3, general: 5 },
  { name: 'Wed', technical: 8, billing: 7, general: 10 },
  { name: 'Thu', technical: 15, billing: 4, general: 6 },
  { name: 'Fri', technical: 11, billing: 6, general: 9 },
  { name: 'Sat', technical: 5, billing: 2, general: 4 },
  { name: 'Sun', technical: 3, billing: 1, general: 2 },
];

const SupportTicketVolumeChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="technical" stackId="a" fill="#8884d8" name="Technical" />
        <Bar dataKey="billing" stackId="a" fill="#82ca9d" name="Billing" />
        <Bar dataKey="general" stackId="a" fill="#ffc658" name="General Inquiry" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SupportTicketVolumeChart;
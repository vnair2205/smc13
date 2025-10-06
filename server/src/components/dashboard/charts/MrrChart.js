import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data. Replace this with data from your API.
const data = [
  { name: 'Jan', mrr: 1200, new: 200, churn: 50 },
  { name: 'Feb', mrr: 1350, new: 250, churn: 100 },
  { name: 'Mar', mrr: 1500, new: 300, churn: 150 },
  { name: 'Apr', mrr: 1650, new: 350, churn: 200 },
  { name: 'May', mrr: 1800, new: 400, churn: 250 },
  { name: 'Jun', mrr: 1950, new: 450, churn: 300 },
];

const MrrChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="new" barSize={20} fill="#413ea0" name="New MRR" />
        <Bar dataKey="churn" barSize={20} fill="#ff7300" name="Churned MRR" />
        <Line type="monotone" dataKey="mrr" stroke="#ff0000" name="Total MRR" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default MrrChart;
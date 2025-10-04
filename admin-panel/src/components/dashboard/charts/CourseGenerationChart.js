import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for the chart. Replace this with data from your API.
const data = [
  { name: 'Mon', courses: 25 },
  { name: 'Tue', courses: 40 },
  { name: 'Wed', courses: 15 },
  { name: 'Thu', courses: 50 },
  { name: 'Fri', courses: 30 },
  { name: 'Sat', courses: 60 },
  { name: 'Sun', courses: 45 },
];

const CourseGenerationChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="courses" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CourseGenerationChart;
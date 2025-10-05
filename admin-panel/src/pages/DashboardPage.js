// admin-panel/src/pages/DashboardPage.js
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FaUsers, FaUserCheck, FaUserSlash, FaUserClock, FaUserTie, FaFileAlt, FaBook, FaTicketAlt, FaFolderOpen, FaFolder } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardAnalytics } from '../services/dashboardService';
import Preloader from '../components/common/Preloader';

// --- STYLED COMPONENTS ---
const DashboardContainer = styled.div`
  padding: 2rem;
  background-color: #161625;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  color: #a0a0b0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled.div`
  background: #1e1e32;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid ${props => props.color || '#5e72e4'};
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: ${props => props.color || '#5e72e4'};
`;

const StatInfo = styled.div`
  h3 {
    margin: 0;
    font-size: 2rem;
    color: #fff;
  }
  p {
    margin: 0;
    color: #a0a0b0;
    font-size: 0.9rem;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ChartContainer = styled.div`
  background: #1e1e32;
  border-radius: 10px;
  padding: 2rem;
  height: 450px;
`;

const ChartTitle = styled.h2`
  color: #fff;
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 1.25rem;
`;

const FilterContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const StyledSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #33333e;
  background-color: #161625;
  color: white;
`;

const COLORS = ['#03D9C5', '#5E72E4', '#FF5B5B', '#FFC107', '#6f42c1'];

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDashboardAnalytics();
                setData(response);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const { years, revenueData } = useMemo(() => {
        if (!data) return { years: [], revenueData: [] };
        
        const monthlyData = {};
        const yearSet = new Set();

        data.charts.revenueByMonth.forEach(item => {
            const { year, month } = item._id;
            yearSet.add(year);
            if (!monthlyData[year]) {
                monthlyData[year] = Array(12).fill(0);
            }
            monthlyData[year][month - 1] = item.totalRevenue;
        });

        const revenueDataFormatted = Array.from(yearSet).sort().flatMap(year => 
            monthlyData[year].map((revenue, index) => ({
                name: `${new Date(year, index).toLocaleString('default', { month: 'short' })} '${String(year).slice(2)}`,
                revenue: revenue,
                year: year
            }))
        );

        return {
            years: ['All', ...Array.from(yearSet).sort().reverse()],
            revenueData: revenueDataFormatted
        };
    }, [data]);

    const filteredRevenueData = useMemo(() => {
        if (selectedYear === 'All') return revenueData;
        return revenueData.filter(d => d.year === parseInt(selectedYear));
    }, [selectedYear, revenueData]);

    if (loading || !data) {
        return <Preloader />;
    }
    
    const { stats, charts } = data;

    return (
        <DashboardContainer>
            <Header>
                <Title>Admin Dashboard</Title>
                <Subtitle>Welcome back, here's an overview of your platform.</Subtitle>
            </Header>

            <StatsGrid>
                <StatCard color="#5e72e4"><StatIcon color="#5e72e4"><FaUsers /></StatIcon><StatInfo><h3>{stats.totalUsers}</h3><p>Total Users</p></StatInfo></StatCard>
                <StatCard color="#03d9c5"><StatIcon color="#03d9c5"><FaUserCheck /></StatIcon><StatInfo><h3>{stats.activeUsers}</h3><p>Active Users</p></StatInfo></StatCard>
                <StatCard color="#ff5b5b"><StatIcon color="#ff5b5b"><FaUserSlash /></StatIcon><StatInfo><h3>{stats.inactiveUsers}</h3><p>Inactive Users</p></StatInfo></StatCard>
                <StatCard color="#f5365c"><StatIcon color="#f5365c"><FaUserClock /></StatIcon><StatInfo><h3>{stats.churnedCustomers}</h3><p>Churned Customers</p></StatInfo></StatCard>
                <StatCard color="#ffd600"><StatIcon color="#ffd600"><FaUserTie /></StatIcon><StatInfo><h3>{stats.droppedCustomers}</h3><p>Dropped Customers</p></StatInfo></StatCard>
                <StatCard color="#11cdef"><StatIcon color="#11cdef"><FaFileAlt /></StatIcon><StatInfo><h3>{stats.totalGeneratedCourses}</h3><p>Courses Generated</p></StatInfo></StatCard>
                <StatCard color="#fb6340"><StatIcon color="#fb6340"><FaBook /></StatIcon><StatInfo><h3>{stats.totalPreGeneratedCourses}</h3><p>Pre-Gen Courses</p></StatInfo></StatCard>
                <StatCard color="#8965e0"><StatIcon color="#8965e0"><FaUsers /></StatIcon><StatInfo><h3>{stats.totalTeamMembers}</h3><p>Team Members</p></StatInfo></StatCard>
                <StatCard color="#2dce89"><StatIcon color="#2dce89"><FaTicketAlt /></StatIcon><StatInfo><h3>{stats.totalTickets}</h3><p>Total Tickets</p></StatInfo></StatCard>
                <StatCard color="#ffd600"><StatIcon color="#ffd600"><FaFolderOpen /></StatIcon><StatInfo><h3>{stats.openTickets}</h3><p>Open Tickets</p></StatInfo></StatCard>
                <StatCard color="#f5365c"><StatIcon color="#f5365c"><FaFolder /></StatIcon><StatInfo><h3>{stats.closedTickets}</h3><p>Closed Tickets</p></StatInfo></StatCard>
            </StatsGrid>

            <ChartGrid>
                <ChartContainer>
                     <FilterContainer>
                        <ChartTitle>Monthly Revenue</ChartTitle>
                        <StyledSelect value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </StyledSelect>
                    </FilterContainer>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={filteredRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#33333e" />
                            <XAxis dataKey="name" stroke="#a0a0b0" />
                            <YAxis stroke="#a0a0b0" />
                            <Tooltip contentStyle={{ backgroundColor: '#161625', border: '1px solid #33333e' }} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#03d9c5" name="Revenue (INR)" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer>
                    <ChartTitle>Active Users by Plan</ChartTitle>
                     <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie data={charts.usersByPlan} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                {charts.usersByPlan.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#161625', border: '1px solid #33333e' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </ChartGrid>
            
            <ChartGrid style={{marginTop: '2rem'}}>
                 <ChartContainer>
                    <ChartTitle>Revenue by Subscription Plan</ChartTitle>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={charts.revenueByPlan} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#33333e" />
                            <XAxis type="number" stroke="#a0a0b0" />
                            <YAxis type="category" dataKey="name" stroke="#a0a0b0" width={120} />
                            <Tooltip contentStyle={{ backgroundColor: '#161625', border: '1px solid #33333e' }} />
                            <Legend />
                            <Bar dataKey="totalRevenue" fill="#5e72e4" name="Total Revenue (INR)" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div></div>
            </ChartGrid>

        </DashboardContainer>
    );
};

export default DashboardPage;
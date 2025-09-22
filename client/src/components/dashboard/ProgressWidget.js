// client/src/components/dashboard/ProgressWidget.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaBook, FaRegLightbulb } from 'react-icons/fa';

const WidgetContainer = styled.div`
  grid-column: span 3;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-top: 1.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
`;

const StatCard = styled.div`
    background-color: #4a4a58;
    padding: 1.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const IconWrapper = styled.div`
    font-size: 2rem;
    color: #8884d8;
`;

const StatInfo = styled.div`
    h4 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
    }
    p {
        margin: 0;
        color: #a0aec0;
        font-size: 0.9rem;
    }
`;

const ProgressWidget = () => {
    const [progressData, setProgressData] = useState({
        totalCoursesGenerated: 0,
        pregeneratedCoursesAccessed: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProgressData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/dashboard/progress-data', {
                    headers: { 'x-auth-token': token }
                });
                setProgressData(res.data);
            } catch (error) {
                console.error("Failed to fetch progress data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgressData();
    }, []);

    const stats = [
        {
            title: "Total Courses Generated",
            value: progressData.totalCoursesGenerated,
            icon: <FaBook />
        },
        {
            title: "Pregenerated Courses Accessed",
            value: progressData.pregeneratedCoursesAccessed,
            icon: <FaRegLightbulb />
        }
    ];

  return (
    <WidgetContainer>
      <h3 style={{ textAlign: 'center' }}>My Progress At-a-Glance</h3>
      {isLoading ? (
          <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : (
        <StatsGrid>
            {stats.map((stat, index) => (
                <StatCard key={index}>
                    <IconWrapper>{stat.icon}</IconWrapper>
                    <StatInfo>
                        <h4>{stat.value}</h4>
                        <p>{stat.title}</p>
                    </StatInfo>
                </StatCard>
            ))}
        </StatsGrid>
      )}
    </WidgetContainer>
  );
};

export default ProgressWidget;
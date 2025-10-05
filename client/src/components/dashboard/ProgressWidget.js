import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaTasks, FaClipboardCheck, FaCertificate } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

const WidgetContainer = styled.div`
  background: ${({ theme }) => theme.colors.bg_secondary};
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text_primary};
  font-size: 1.25rem;
  font-weight: 600;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* This is the fix */
  gap: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme, color }) => color || theme.colors.bg_primary};
  padding: 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
`;

const CardContent = styled.div`
  text-align: left;
`;

const CardValue = styled.p`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`;

const CardTitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const ProgressWidget = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalCourses: 0,
        pregeneratedAccessed: 0,
        inProgress: 0,
        completed: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // --- FIX STARTS HERE ---
                // Change the endpoint to match the server route
                const { data } = await api.get('/dashboard/progress-data');
                // --- FIX ENDS HERE ---
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch progress stats", error);
            }
        };
        fetchStats();
    }, []);

    const cardsData = [
        { title: t('totalCourses'), value: stats.totalCoursesGenerated, icon: <FaBook />, color: '#6C63FF' },
         { title: t('pregeneratedAccessed'), value: stats.pregeneratedCoursesAccessed, icon: <FaTasks />, color: '#3498DB' },
        { title: t('inProgress'), value: stats.inProgressCourses, icon: <FaClipboardCheck />, color: '#F39C12' },
        { title: t('completed'), value: stats.completedCourses, icon: <FaCertificate />, color: '#2ECC71' },
    ];

    return (
        <WidgetContainer>
            <Title>{t('yourProgress')}</Title>
            <CardsGrid>
                {cardsData.map((card, index) => (
                    <Card key={index} color={card.color}>
                        <IconWrapper>{card.icon}</IconWrapper>
                        <CardContent>
                            <CardValue>{card.value}</CardValue>
                            <CardTitle>{card.title}</CardTitle>
                        </CardContent>
                    </Card>
                ))}
            </CardsGrid>
        </WidgetContainer>
    );
};

export default ProgressWidget;
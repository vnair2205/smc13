// client/src/components/dashboard/ProgressWidget.js
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme, color }) => color || theme.colors.bg_tertiary};
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
`;

const IconWrapper = styled.div`
  font-size: 2rem;
  opacity: 0.8;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardValue = styled.span`
  font-size: 2rem;
  font-weight: 700;
`;

const CardTitle = styled.span`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const ProgressWidget = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalCoursesGenerated: 0,
        pregeneratedCoursesAccessed: 0,
        inProgressCourses: 0,
        completedCourses: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/progress-data');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch progress stats", error);
            }
        };
        fetchStats();
    }, []);

    const cardsData = [
        { title: t('dashboard.progress_widget.total_courses'), value: stats.totalCoursesGenerated, icon: <FaBook />, color: '#6C63FF' },
        { title: t('dashboard.progress_widget.pregenerated_accessed'), value: stats.pregeneratedCoursesAccessed, icon: <FaTasks />, color: '#3498DB' },
        { title: t('dashboard.progress_widget.in_progress'), value: stats.inProgressCourses, icon: <FaClipboardCheck />, color: '#F39C12' },
        { title: t('dashboard.progress_widget.completed'), value: stats.completedCourses, icon: <FaCertificate />, color: '#2ECC71' },
    ];

    return (
        <WidgetContainer>
            <Title>{t('dashboard.progress_widget.title')}</Title>
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
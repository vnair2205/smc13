import React from 'react';
import styled from 'styled-components';
import { FaUsers, FaUserCheck, FaUserSlash } from 'react-icons/fa';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 220px;
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  color: ${({ color }) => color};
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 0.5rem 0;
  font-weight: 500;
`;

const Count = styled.p`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ICONS = {
  total: <FaUsers />,
  active: <FaUserCheck />,
  inactive: <FaUserSlash />,
};

const COLORS = {
  total: '#5e72e4',
  active: '#2dce89',
  inactive: '#f5365c',
};

const StatCard = ({ title, count, type = 'total' }) => {
  return (
    <Card>
      <IconWrapper color={COLORS[type]}>{ICONS[type]}</IconWrapper>
      <Info>
        <Title>{title}</Title>
        <Count>{count}</Count>
      </Info>
    </Card>
  );
};

export default StatCard;
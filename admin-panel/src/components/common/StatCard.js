// admin-panel/src/components/common/StatCard.js
import React from 'react';
import styled from 'styled-components';
import { FaUsers, FaUserCheck, FaUserSlash } from 'react-icons/fa';

// --- Styled Components (No changes here) ---
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
  total: '#3498db',
  active: '#2ecc71',
  inactive: '#e74c3c',
};

// --- Component Logic ---
const StatCard = ({ title, value, icon, type }) => {
  const displayIcon = ICONS[type] || icon;
  const displayColor = COLORS[type] || '#3498db';

  // V V V THIS IS THE FIX V V V
  // Ensure we always have a number to display.
  const displayValue = typeof value === 'number' ? value : 0;
  // ^ ^ ^ END OF THE FIX ^ ^ ^

  return (
    <Card>
      <IconWrapper color={displayColor}>
        {displayIcon}
      </IconWrapper>
      <Info>
        <Title>{title}</Title>
        {/* Render the corrected value */}
        <Count>{displayValue}</Count>
      </Info>
    </Card>
  );
};

export default StatCard;
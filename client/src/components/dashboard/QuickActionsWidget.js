// client/src/components/dashboard/QuickActionsWidget.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const WidgetContainer = styled.div`
  grid-column: span 1;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActionButton = styled(Link)`
  padding: 1rem;
  background-color: #03d9c5;
  color: white;
  text-align: center;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #02b3a3;
  }
`;

const QuickActionsWidget = () => {
  const { t } = useTranslation(); // Initialize t function

  return (
    <WidgetContainer>
      <ActionButton to="/generate-course">{t('dashboard.quick_actions_widget.generate_new_course')}</ActionButton>
      <ActionButton to="/pre-generated">{t('dashboard.quick_actions_widget.browse_pre_generated')}</ActionButton>
    </WidgetContainer>
  );
};

export default QuickActionsWidget;
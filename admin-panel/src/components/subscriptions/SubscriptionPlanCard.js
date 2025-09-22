// admin-panel/src/components/subscriptions/SubscriptionPlanCard.js
import React from 'react';
import styled from 'styled-components';
import { FiEdit, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';

const Card = styled.div`
  /* FIX: Changed background to a dark color from your theme */
  background: ${({ theme }) => theme.colors.background}; 
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  /* FIX: Explicitly set text color to be visible */
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${({ isPublic, theme }) => isPublic ? 'rgba(3, 172, 146, 0.2)' : 'rgba(255, 184, 0, 0.2)'};
  color: ${({ isPublic, theme }) => isPublic ? theme.colors.primary : '#ffb800'};
`;

const PlanPrice = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  span {
    font-size: 1rem;
    font-weight: normal;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  margin-bottom: 0.75rem;
  /* FIX: Ensure this text is also visible */
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
      color: ${({ theme }) => theme.colors.text};
  }
`;

const RazorpayID = styled.code`
  /* FIX: Changed background and text color for dark mode */
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 5px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* FIX: Set icon color */
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:hover {
    /* FIX: Changed hover background for dark mode */
    background-color: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;



const SubscriptionPlanCard = ({ plan, onEdit, onDelete }) => {
  const isPublic = plan.isPublic === false ? false : true;
   return (
    <Card>
      {/* *** UPDATED HEADER TO INCLUDE THE BADGE *** */}
      <Header>
        <PlanName>{plan.name}</PlanName>
        <StatusBadge isPublic={isPublic}>
          {isPublic ? <FiEye /> : <FiEyeOff />}
          {isPublic ? 'Public' : 'Private'}
        </StatusBadge>
      </Header>
      
      <PlanPrice>
        ₹{plan.amount} <span>/ month</span>
      </PlanPrice>
      <FeatureList>
        <FeatureItem>
          <strong>{plan.coursesPerMonth}</strong> Courses / month
        </FeatureItem>
        <FeatureItem>
          <strong>{plan.subtopicsPerCourse}</strong> Subtopics / course
        </FeatureItem>
        <FeatureItem>
          Razorpay ID: <RazorpayID>{plan.razorpayPlanId}</RazorpayID>
        </FeatureItem>
      </FeatureList>
      <CardActions>
        <ActionButton onClick={onEdit} title="Edit Plan">
          <FiEdit />
        </ActionButton>
        <ActionButton onClick={onDelete} title="Delete Plan">
          <FiTrash2 style={{ color: '#dc3545' }}/>
        </ActionButton>
      </CardActions>
    </Card>
  );
};

export default SubscriptionPlanCard;
// admin-panel/src/components/subscriptions/SubscriptionPlanCard.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiLink, FiCopy } from 'react-icons/fi';

// ... (keep all styled components as they are)
const Card = styled.div`
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
  background-color: ${({ isPublic, theme }) => isPublic ? theme.colors.successAlpha : theme.colors.dangerAlpha};
  color: ${({ isPublic, theme }) => isPublic ? theme.colors.success : theme.colors.danger};
`;

const PlanPrice = styled.div`
  font-size: 2.25rem;
  font-weight: bold;
  margin: 1rem 0;
  color: ${({ theme }) => theme.colors.primary};

  span {
    font-size: 1rem;
    font-weight: normal;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
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

const PlanUrlContainer = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-top: 1rem;
`;

const UrlInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
`;

const UrlIcon = styled(FiLink)`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UrlInput = styled.input`
  flex-grow: 1;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;


const SubscriptionPlanCard = ({ plan, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  
  const isPublic = plan.isPublic !== false;

  // --- FIX: Using environment variable for the base URL ---
  const clientUrl = process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000';
  const planUrl = `${clientUrl}/signup?planId=${plan._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(planUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

   return (
    <Card>
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
       
      </FeatureList>
      <CardActions>
        <ActionButton onClick={onEdit} title="Edit Plan">
          <FiEdit />
        </ActionButton>
        <ActionButton onClick={onDelete} title="Delete Plan">
          <FiTrash2 />
        </ActionButton>
      </CardActions>

      <PlanUrlContainer>
        <UrlInputGroup>
          <UrlIcon />
          <UrlInput type="text" value={planUrl} readOnly />
          <CopyButton onClick={handleCopy} title="Copy URL">
            {copied ? 'Copied!' : <FiCopy />}
          </CopyButton>
        </UrlInputGroup>
      </PlanUrlContainer>
    </Card>
  );
};

export default SubscriptionPlanCard;
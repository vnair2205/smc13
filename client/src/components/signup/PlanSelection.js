// client/src/components/signup/PlanSelection.js
import React from 'react';
import styled from 'styled-components';
import { FiCheck } from 'react-icons/fi';

// --- STYLES (No changes needed) ---

const PlanContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 3rem;
  text-align: center;
`;

const PlanGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
`;

const PlanCard = styled.div`
  background: #2a2a38;
  border: 1px solid #3c3c4c;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  text-align: left;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PlanName = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.p`
  font-size: 2.5rem;
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
  margin: 0 0 2rem 0;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`;

const PlanButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: auto;

  &:hover {
    opacity: 0.9;
  }
`;

const PlanSelection = ({ plans, onSelect }) => {
    // List of common features for all plans
    const commonFeatures = [
        "Refine Course Topics with AI",
        "Refine Course Objective with AI",
        "Refine Course Index and Lessons",
        "AI Tutor Access for AI Generated Courses",
        "Verifiable Certificates for Self-generated Courses",
        "Multilingual Course Generation",
        "Export Course as PDF",
        "Access to over 8000 Industry-Ready Courses"
    ];

    return (
        <PlanContainer>
            <Title>Choose Your Plan</Title>
            <Subtitle>Select the subscription that best fits your learning goals.</Subtitle>
            <PlanGrid>
                {plans.map(plan => (
                    <PlanCard key={plan._id}>
                        <PlanName>{plan.name}</PlanName>
                        <PlanPrice>
                            ₹{plan.amount} <span>/ month</span>
                        </PlanPrice>
                        <FeatureList>
                            {/* Dynamic Features */}
                            <FeatureItem>
                                <FiCheck size={20}/> 
                                <span><strong>{plan.coursesPerMonth}</strong> AI Generated Courses per month</span>
                            </FeatureItem>
                            <FeatureItem>
                                <FiCheck size={20}/>
                                <span><strong>{plan.subtopicsPerCourse}</strong> Subtopics per course</span>
                            </FeatureItem>
                            
                            {/* --- FIX: Added the list of common features --- */}
                            {commonFeatures.map((feature, index) => (
                                <FeatureItem key={index}>
                                    <FiCheck size={20}/>
                                    <span>{feature}</span>
                                </FeatureItem>
                            ))}
                        </FeatureList>
                        <PlanButton onClick={() => onSelect(plan)}>Get Started</PlanButton>
                    </PlanCard>
                ))}
            </PlanGrid>
        </PlanContainer>
    );
};

export default PlanSelection;
// client/src/components/signup/PlanSelection.js
// client/src/components/signup/PlanSelection.js
import React from 'react';
import styled from 'styled-components';
import { FiCheck } from 'react-icons/fi';

// --- STYLES (No changes needed) ---





const PlanContainer = styled.div`
  width: 100%;
  padding: 1rem 0;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;

  /* --- THIS IS THE FIX --- */
  /* This media query will now stack the cards into a single column
     on screens 768px or narrower (standard for mobile phones). */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div`
  background: #2a2a38;
  border: 1px solid #3c3c4c;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const PlanName = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  span {
    font-size: 1rem;
    font-weight: normal;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  text-align: left;
  width: 100%;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-right: 10px;
    min-width: 20px;
  }
`;

const PlanButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #04bda9;
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
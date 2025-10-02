import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import PlanSelection from '../components/signup/PlanSelection';
import RegistrationForm from '../components/signup/RegistrationForm';
import Preloader from '../components/common/Preloader';

const SignupPageContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const LoadingText = styled.p`
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.2rem;
`;

// --- START: NEW STYLED COMPONENT ---
const FooterText = styled.div`
  text-align: center;
  margin-top: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;

  p {
    margin: 0.5rem 0;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;
// --- END: NEW STYLED COMPONENT ---


const SignupPage = () => {
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Use the location object from the hook
                const params = new URLSearchParams(location.search);
                const refCode = params.get('ref');

                if (refCode) {
                    console.log("Referral Code Found:", refCode);
                    // In a future step, we will add an API call here
                    // to fetch referral details and auto-select the plan.
                }

                const res = await axios.get('/api/subscriptions/plans');
                setPlans(res.data.docs || []);
            } catch (err) {
                console.error("Failed to fetch plans", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, [location]); // The dependency array is correct

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedPlan(null);
    };

    const handleRegistrationSuccess = (userData) => {
        navigate('/verify-phone', { 
            state: { 
                email: userData.email, 
                phone: userData.phone 
            } 
        });
    };

    if (isLoading) {
        return (
            <SignupPageContainer>
                <Preloader />
            </SignupPageContainer>
        );
    }

    return (
        <SignupPageContainer>
            {/* --- FIX: The prop name here must match what PlanSelection expects. --- */}
            {/* Assuming PlanSelection uses `onSelect` based on your previous code. */}
            {step === 1 && <PlanSelection plans={plans} onSelect={handlePlanSelect} />}
            
            {/* --- FIX: Pass the 'onSuccess' prop to RegistrationForm. --- */}
            {step === 2 && 
                <RegistrationForm 
                    plan={selectedPlan} 
                    onBack={handleBack} 
                    onSuccess={handleRegistrationSuccess} 
                />
            }
        </SignupPageContainer>
    );
};

export default SignupPage;
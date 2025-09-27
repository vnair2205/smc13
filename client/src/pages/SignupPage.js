import React, { useState, useEffect } from 'react'; // <-- FIX: Added useEffect here
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

const SignupPage = () => {
    const [step, setStep] = useState(1); // 1: Plan Selection, 2: Registration Form
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await axios.get('/api/subscriptions/public');
                setPlans(res.data);
            } catch (err) {
                console.error("Failed to fetch plans", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedPlan(null);
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
            {step === 1 && <PlanSelection plans={plans} onSelect={handlePlanSelect} />}
            {step === 2 && <RegistrationForm plan={selectedPlan} onBack={handleBack} />}
        </SignupPageContainer>
    );
};

export default SignupPage;
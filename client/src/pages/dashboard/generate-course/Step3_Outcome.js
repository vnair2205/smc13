import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
    StepContentContainer,
    StepHeader,
    StepTitle,
    StepDescription,
    NavigationButtons,
    NavButton
} from './GenerateCourse.styles';

/* --- FIX 1: Create a new container that overrides styles on mobile --- */
const MobileOptimizedContainer = styled(StepContentContainer)`
    @media (max-width: 768px) {
        background-color: transparent;
        padding: 0;
        border: none;
        box-shadow: none;
    }
`;

const OutcomesList = styled.div`
    display: grid; /* Changed to grid for better card layout */
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const OutcomeBox = styled.div`
    background-color: #33333d;
    border: 1px solid #555;
    border-radius: 8px;
    padding: 1.5rem; /* Increased padding */
    font-size: 1rem;
    color: white;
    display: flex;
    align-items: flex-start; /* Align top for better text flow */
    min-height: 100px; /* Give cards a minimum height */
`;

const OutcomeNumber = styled.span`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-right: 1rem;
`;

const OutcomeText = styled.span`
    flex-grow: 1;
    line-height: 1.5; /* Improve readability */
`;

const Step3_Outcome = ({ nextStep, prevStep, data, isLoading }) => {
    const { t } = useTranslation();
    const isRTL = ['ar', 'ur'].includes(data.language);

    const outcomesArray = data.outcome;

    return (
        <MobileOptimizedContainer dir={isRTL ? 'rtl' : 'ltr'}>
            <StepHeader>
                <StepTitle>{t('course_generation.step3_title')}</StepTitle>
                <StepDescription>{t('course_generation.step3_description')}</StepDescription>
            </StepHeader>

            <OutcomesList>
                {outcomesArray.map((outcome, index) => (
                    <OutcomeBox key={index} dir={isRTL ? 'rtl' : 'ltr'}>
                        <OutcomeNumber>{index + 1}.</OutcomeNumber>
                        <OutcomeText>{outcome}</OutcomeText>
                    </OutcomeBox>
                ))}
            </OutcomesList>

            <NavigationButtons>
                <NavButton onClick={prevStep} disabled={isLoading}>{t('course_generation.back_button')}</NavButton>
                <NavButton primary onClick={nextStep} disabled={isLoading || outcomesArray.length === 0}>
                    {isLoading ? t('course_generation.generating_button') : t('course_generation.next_button')}
                </NavButton>
            </NavigationButtons>
        </MobileOptimizedContainer>
    );
};

export default Step3_Outcome;
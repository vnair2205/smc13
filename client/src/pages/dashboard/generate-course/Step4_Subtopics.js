import React from 'react';
import styled from 'styled-components';
import {
    StepContentContainer,
    StepHeader,
    StepTitle,
    StepDescription,
    NavigationButtons,
    NavButton
} from './GenerateCourse.styles';
import { useTranslation } from 'react-i18next'; // Import useTranslation

/* --- FIX 1: Create a new container that becomes transparent on mobile --- */
const MobileOptimizedContainer = styled(StepContentContainer)`
    @media (max-width: 768px) {
        background-color: transparent;
        padding: 0;
        border: none;
        box-shadow: none;
    }
`;

/* --- FIX 2: Changed to a CSS Grid for equal-sized cards --- */
const OptionsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Creates two equal columns */
    gap: 1.5rem;
    margin-top: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr; /* Stacks to a single column on mobile */
        gap: 1rem;
    }
`;

/* --- FIX 3: Adjusted styles for better appearance and consistent size --- */
const OptionButton = styled.button`
    padding: 1.5rem;
    border-radius: 8px;
    border: 2px solid ${({ active, theme }) => (active ? theme.colors.primary : '#555')};
    background-color: ${({ active, theme }) => (active ? theme.colors.primary + '20' : '#33333d')};
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 100%; /* Ensure button fills the grid cell */
    height: 100%; /* Ensure all buttons have the same height */
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 100px; /* Give a minimum height */

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary};
        background-color: ${({ theme }) => theme.colors.primary + '10'};
    }
`;


const Step4_Subtopics = ({ nextStep, prevStep, updateCourseData, data }) => {
    const { t } = useTranslation(); // Initialize useTranslation
    const handleSelect = (num) => {
        updateCourseData({ numSubtopics: num });
    };
    
    const subtopicOptions = [1, 5, 10, 15];

    return (
         <MobileOptimizedContainer>
            <StepHeader>
                <StepTitle>{t('course_generation.step4_title')}</StepTitle>
                <StepDescription>{t('course_generation.step4_description')}</StepDescription>
            </StepHeader>

            <OptionsContainer>
                {subtopicOptions.map(num => (
                    <OptionButton
                        key={num}
                        active={data.numSubtopics === num}
                        onClick={() => handleSelect(num)}
                    >
                        {num} {t(num === 1 ? 'course_generation.subtopic_label' : 'course_generation.subtopics_label', { count: num })}
                    </OptionButton>
                ))}
            </OptionsContainer>

            <NavigationButtons>
                <NavButton onClick={prevStep}>{t('course_generation.back_button')}</NavButton>
                <NavButton primary onClick={nextStep} disabled={!data.numSubtopics}>{t('course_generation.next_button')}</NavButton>
            </NavigationButtons>
        </MobileOptimizedContainer>
    );
};

export default Step4_Subtopics;
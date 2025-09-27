import React, { useState } from 'react';
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

/* --- FIX: Changed from flex to a responsive grid --- */
/* --- FIX 1: Create a new container that overrides styles on mobile --- */
const MobileOptimizedContainer = styled(StepContentContainer)`
    @media (max-width: 768px) {
        background-color: transparent;
        padding: 0;
        border: none;
        box-shadow: none;
    }
`;

const ObjectivesList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const ObjectiveCard = styled.div`
    background-color: #33333d;
    border: 1px solid #555;
    border-radius: 8px;
    padding: 1.5rem;
    font-size: 1rem;
    color: white;
    display: flex;
    align-items: flex-start;
    min-height: 100px;
`;

const ObjectiveNumber = styled.span`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-right: 1rem;
    font-size: 1.1rem;
`;

const ObjectiveText = styled.span`
    flex-grow: 1;
    line-height: 1.5;
`;

const AddObjectiveForm = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    position: relative;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const AddObjectiveInput = styled.input`
    flex-grow: 1;
    height: 56px;
    padding: 1rem;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid #555;
    background-color: #33333d;
    color: white;
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

const AddButton = styled(NavButton)`
    padding: 0.8rem 1.5rem;
    height: 56px;
    flex-shrink: 0; 
`;

const MaxObjectivesMessage = styled.p`
    color: ${({ theme }) => theme.colors.error};
    text-align: center;
    margin-top: 1rem;
    min-height: 20px;
`;

const Step2_Objective = ({ nextStep, prevStep, data, isLoading, handleAddObjective }) => {
    const { t } = useTranslation();
    const isRTL = ['ar', 'ur'].includes(data.language);

    const [newObjective, setNewObjective] = useState('');

    const combinedObjectives = [...(data.objective || []), ...(data.customObjectives || [])];
    const canAddMoreObjectives = (data.customObjectives || []).length < 2;

    const handleAddClick = () => {
        if (newObjective.trim()) {
            handleAddObjective(newObjective);
            setNewObjective('');
        }
    };

    return (
        <MobileOptimizedContainer dir={isRTL ? 'rtl' : 'ltr'}>
            <StepHeader>
                <StepTitle>{t('course_generation.step2_title')}</StepTitle>
                <StepDescription>{t('course_generation.step2_description')}</StepDescription>
            </StepHeader>

            <ObjectivesList>
                {combinedObjectives.map((obj, index) => (
                    <ObjectiveCard key={index} dir={isRTL ? 'rtl' : 'ltr'}>
                        <ObjectiveNumber>{index + 1}.</ObjectiveNumber>
                        <ObjectiveText>{obj}</ObjectiveText>
                    </ObjectiveCard>
                ))}
            </ObjectivesList>

            <AddObjectiveForm>
                <AddObjectiveInput
                    type="text"
                    placeholder={t('course_generation.enter_objective_placeholder')}
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    disabled={!canAddMoreObjectives || isLoading}
                />
                <AddButton
                    primary
                    onClick={handleAddClick}
                    disabled={!newObjective || !canAddMoreObjectives || isLoading}
                >
                    {isLoading ? t('course_generation.generating_button') : t('course_generation.add_button')}
                </AddButton>
            </AddObjectiveForm>
            {!canAddMoreObjectives && (
                <MaxObjectivesMessage>{t('course_generation.add_custom_objective_heading', { maxCustomLessons: 2 })}</MaxObjectivesMessage>
            )}

            <NavigationButtons>
                <NavButton onClick={prevStep} disabled={isLoading}>{t('course_generation.back_button')}</NavButton>
                <NavButton primary onClick={nextStep} disabled={isLoading || combinedObjectives.length === 0}>
                    {isLoading ? t('course_generation.generating_button') : t('course_generation.next_button')}
                </NavButton>
            </NavigationButtons>
        </MobileOptimizedContainer>
    );
};

export default Step2_Objective;
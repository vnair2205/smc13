// SM10/client/src/pages/dashboard/generate-course/Step1_Topic.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    StepContentContainer,
    StepHeader,
    StepTitle,
    StepDescription,
    InputWrapper,
    AnimatedPlaceholder,
    StyledInput,
    NavigationButtons,
    NavButton
} from './GenerateCourse.styles';
import { useTranslation } from 'react-i18next';

const ApiErrorText = styled.p`
    color: ${({ theme }) => theme.colors.error};
    text-align: center;
    margin-top: 1rem;
    min-height: 20px;
`;

// *** FIX: Changed 'updateCourseData' to 'onDataChange' and 'data' to 'courseData' ***
const Step1_Topic = ({ onNext, onPrev, onDataChange, courseData = {}, isLoading, error }) => {
    const { t } = useTranslation();
    
    const isRTL = ['ar', 'ur'].includes(courseData.language);

    const translatedPlaceholderExamples = [
        t("placeholder.example1"),
        t("placeholder.example2"),
        t("placeholder.example3"),
        t("placeholder.example4"),
    ];
    
    const [animatedPlaceholderText, setAnimatedPlaceholderText] = useState(translatedPlaceholderExamples[0]);
    const [showAnimatedPlaceholder, setShowAnimatedPlaceholder] = useState(true);

    useEffect(() => {
        if (courseData.topic) {
            setShowAnimatedPlaceholder(false);
        } else {
            setShowAnimatedPlaceholder(true);
        }

        const interval = setInterval(() => {
            setAnimatedPlaceholderText(prev => {
                const currentIndex = translatedPlaceholderExamples.indexOf(prev);
                const nextIndex = (currentIndex + 1) % translatedPlaceholderExamples.length;
                return translatedPlaceholderExamples[nextIndex];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [courseData.topic, translatedPlaceholderExamples]);


    return (
        <StepContentContainer>
            <StepHeader>
                <StepTitle>{t('course_generation.step1_title')}</StepTitle>
                <StepDescription>{t('course_generation.step1_description')}</StepDescription>
            </StepHeader>

            <InputWrapper>
                <StyledInput
                    type="text"
                    value={courseData.topic || ''}
                    // *** FIX: Call onDataChange with the correct arguments ***
                    onChange={(e) => onDataChange('topic', e.target.value)}
                    placeholder={showAnimatedPlaceholder ? "" : t('placeholder.enterTopic')}
                    disabled={isLoading}
                    dir={isRTL ? 'rtl' : 'ltr'}
                />
                {showAnimatedPlaceholder && (
                     <AnimatedPlaceholder key={animatedPlaceholderText}>{animatedPlaceholderText}</AnimatedPlaceholder>
                )}
            </InputWrapper>

            <ApiErrorText>{error}</ApiErrorText>

            <NavigationButtons>
                {/* Note: onPrev might not be passed from the parent for the first step */}
                <NavButton onClick={onPrev} disabled={isLoading}>
                    {t('course_generation.back_button')}
                </NavButton>
                <NavButton
                    primary
                    onClick={onNext} // Use onNext here
                    disabled={!courseData.topic || isLoading}
                >
                    {isLoading ? t('course_generation.generating_button') : t('course_generation.next_button')}
                </NavButton>
            </NavigationButtons>
        </StepContentContainer>
    );
};

export default Step1_Topic;
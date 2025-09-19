// client/src/pages/dashboard/generate-course/GenerateCoursePage.js

import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // We don't need the original axios anymore
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from './GenerateCourse.styles';
import ProgressBar from './ProgressBar';
import Preloader from '../../../components/common/Preloader';
import { Modal, ModalText, ModalButtonContainer, ModalButton } from '../../../components/common/Modal';
import api from '../../../utils/api'; // <-- We will use this for all calls

// Import all the step components
import Step1_Topic from './Step1_Topic';
import Step2_Objective from './Step2_Objective';
import Step3_Outcome from './Step3_Outcome';
import Step4_Subtopics from './Step4_Subtopics';
import Step5_Language from './Step5_Language';
import Step6_Index from './Step6_Index';

const SuggestionButton = styled(ModalButton)`
    width: 100%;
    margin-bottom: 0.75rem;
    text-align: center;
`;

const GenerateCoursePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [courseData, setCourseData] = useState({
        courseId: null,
        topic: '',
        englishTopic: '',
        objective: [],
        englishObjective: [],
        outcome: '',
        englishOutcome: '',
        numSubtopics: 1,
        language: 'en',
        languageName: 'English',
        nativeName: 'English',
        index: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isRefineTopicModalOpen, setIsRefineTopicModalOpen] = useState(false);
    const [topicSuggestions, setTopicSuggestions] = useState([]);
    const [isRefineObjectiveModalOpen, setIsRefineObjectiveModalOpen] = useState(false);
    const [objectiveSuggestions, setObjectiveSuggestions] = useState([]);

    const [canGenerate, setCanGenerate] = useState(false);
    const [showQuotaPopup, setShowQuotaPopup] = useState(false);
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

    useEffect(() => {
        const checkSubscriptionStatus = async () => {
            try {
                // *** FIX: Use 'api' instead of 'axios' ***
                const res = await api.get('/subscriptions/history');
                const { currentPlan } = res.data;
                if (currentPlan && currentPlan.coursesGenerated < currentPlan.totalCourses) {
                    setCanGenerate(true);
                } else {
                    setCanGenerate(false);
                }
            } catch (error) {
                console.error("Error fetching subscription status", error);
                setCanGenerate(false);
            } finally {
                setIsCheckingSubscription(false);
            }
        };
        checkSubscriptionStatus();
    }, []);


    const handleDataChange = (field, value) => {
        setCourseData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            if (!canGenerate) {
                setShowQuotaPopup(true);
                return;
            }
            setIsLoading(true);
            try {
                // *** FIX: Use 'api' instead of 'axios' ***
                const res = await api.post('/courses/refine-topic', { topic: courseData.topic, language: courseData.language, languageName: courseData.languageName, nativeName: courseData.nativeName });
                setTopicSuggestions(res.data.suggestions);
                setCourseData(prev => ({ ...prev, englishTopic: res.data.englishTopic }));
                setIsRefineTopicModalOpen(true);
            } catch (error) {
                console.error("Error refining topic:", error);
            } finally {
                setIsLoading(false);
            }
        } else if (currentStep === 2) {
             setIsLoading(true);
             try {
                 // *** FIX: Use 'api' instead of 'axios' ***
                 const res = await api.post('/courses/generate-outcome', {
                     topic: courseData.topic,
                     objective: courseData.objective,
                     englishTopic: courseData.englishTopic,
                     englishObjective: courseData.englishObjective,
                     language: courseData.language,
                     languageName: courseData.languageName,
                     nativeName: courseData.nativeName
                 });
                 setCourseData(prev => ({ ...prev, outcome: res.data.outcome, englishOutcome: res.data.englishOutcome }));
                 setCurrentStep(3);
             } catch (error) {
                 console.error("Error generating outcome:", error);
             } finally {
                 setIsLoading(false);
             }
        } else if (currentStep === 3) {
            setCurrentStep(4);
        } else if (currentStep === 4) {
            setCurrentStep(5);
        } else if (currentStep === 5) {
             setIsLoading(true);
             try {
                // *** FIX: Use 'api' instead of 'axios' ***
                const res = await api.post('/courses', {
                    topic: courseData.topic,
                    objective: courseData.objective,
                    outcome: courseData.outcome,
                    numSubtopics: courseData.numSubtopics,
                    language: courseData.language,
                    languageName: courseData.languageName,
                    nativeName: courseData.nativeName,
                    englishTopic: courseData.englishTopic,
                    englishObjective: courseData.englishObjective,
                    englishOutcome: courseData.englishOutcome,
                });
                 setCourseData(prev => ({ ...prev, courseId: res.data.courseId }));
                 setCurrentStep(6);
             } catch (error) {
                 console.error("Error creating course:", error);
             } finally {
                 setIsLoading(false);
             }
        }
    };
    
    const proceedToObjectiveGeneration = async (selectedSuggestion) => {
        setCourseData(prev => ({
            ...prev,
            topic: selectedSuggestion.title,
            englishTopic: selectedSuggestion.englishTitle
        }));
        setIsRefineTopicModalOpen(false);
        setIsLoading(true);
        try {
            // *** FIX: Use 'api' instead of 'axios' ***
            const res = await api.post('/courses/generate-objective', {
                topic: selectedSuggestion.title,
                englishTopic: selectedSuggestion.englishTitle,
                language: courseData.language,
                languageName: courseData.languageName,
                nativeName: courseData.nativeName,
            });
            setCourseData(prev => ({
                ...prev,
                objective: res.data.objective,
                englishObjective: res.data.englishObjective
            }));
            setCurrentStep(2);
        } catch (error) {
            console.error("Error generating objectives:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRefineObjective = async (index, value) => {
        setIsLoading(true);
        try {
            // *** FIX: Use 'api' instead of 'axios' ***
            const res = await api.post('/courses/refine-objective', {
                topic: courseData.topic,
                englishTopic: courseData.englishTopic,
                objective: value,
                language: courseData.language,
                languageName: courseData.languageName,
                nativeName: courseData.nativeName
            });
            setObjectiveSuggestions(res.data.suggestions);
            setIsRefineObjectiveModalOpen(true);
        } catch (error) {
            console.error("Error refining objective:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // ... (rest of your component remains the same)
    const handleSelectObjectiveSuggestion = (suggestion) => {
        const newObjectives = [...courseData.objective];
        const newEnglishObjectives = [...courseData.englishObjective];
        const index = courseData.objective.findIndex(obj => obj === objectiveSuggestions.originalObjective);
        
        if (index !== -1) {
            newObjectives[index] = suggestion.objective;
            newEnglishObjectives[index] = suggestion.englishObjective;
            setCourseData(prev => ({
                ...prev,
                objective: newObjectives,
                englishObjective: newEnglishObjectives
            }));
        }
        setIsRefineObjectiveModalOpen(false);
    };


    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1_Topic courseData={courseData} onDataChange={handleDataChange} onNext={handleNext} />;
            case 2:
                return <Step2_Objective courseData={courseData} onDataChange={handleDataChange} onNext={handleNext} onPrev={handlePrev} onRefine={handleRefineObjective} />;
            case 3:
                return <Step3_Outcome courseData={courseData} onDataChange={handleDataChange} onNext={handleNext} onPrev={handlePrev} />;
            case 4:
                return <Step4_Subtopics courseData={courseData} onDataChange={handleDataChange} onNext={handleNext} onPrev={handlePrev} />;
            case 5:
                return <Step5_Language courseData={courseData} onDataChange={handleDataChange} onNext={handleNext} onPrev={handlePrev} />;
            case 6:
                return <Step6_Index courseData={courseData} onDataChange={handleDataChange} />;
            default:
                return <Step1_Topic courseData={courseData} onDataChange={handleDataChange} onNext={handleNext} />;
        }
    };

    if (isLoading || isCheckingSubscription) {
        return <Preloader />;
    }

    return (
        <PageWrapper>
            <Modal isOpen={showQuotaPopup} onClose={() => setShowQuotaPopup(false)} title={t('course_generation.quota_exceeded_title')}>
                <ModalText>{t('course_generation.quota_exceeded_message')}</ModalText>
                <ModalButtonContainer>
                    <ModalButton onClick={() => setShowQuotaPopup(false)}>{t('common.close')}</ModalButton>
                    <ModalButton primary onClick={() => navigate('/dashboard/subscription-history')}>{t('course_generation.upgrade_plan')}</ModalButton> 
                </ModalButtonContainer>
            </Modal>

            <Modal isOpen={isRefineTopicModalOpen} onClose={() => setIsRefineTopicModalOpen(false)} title={t('course_generation.refine_topic_modal_title')}>
                <ModalText>{t('course_generation.refine_topic_modal_message')}</ModalText>
                <ModalButtonContainer style={{ flexDirection: 'column', marginTop: '1.5rem' }}>
                    {topicSuggestions.map((suggestion, index) => (
                        <SuggestionButton primary key={index} onClick={() => proceedToObjectiveGeneration(suggestion)}>
                            {courseData.language === 'en' ? suggestion.title : `${suggestion.title} (${suggestion.englishTitle})`}
                        </SuggestionButton>
                    ))}
                </ModalButtonContainer>
            </Modal>

            <Modal isOpen={isRefineObjectiveModalOpen} onClose={() => setIsRefineObjectiveModalOpen(false)} title={t('course_generation.refine_objective_modal_title')}>
                <ModalText>{t('course_generation.refine_objective_modal_message')}</ModalText>
                <ModalButtonContainer style={{ flexDirection: 'column', marginTop: '1.5rem' }}>
                    {objectiveSuggestions.map((suggestion, index) => (
                        <SuggestionButton primary key={index} onClick={() => handleSelectObjectiveSuggestion(suggestion)}>
                            {suggestion.objective}
                        </SuggestionButton>
                    ))}
                </ModalButtonContainer>
            </Modal>

            <ProgressBar currentStep={currentStep} />
            {renderStep()}
        </PageWrapper>
    );
};

export default GenerateCoursePage;
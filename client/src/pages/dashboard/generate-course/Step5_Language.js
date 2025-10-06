import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    StepContentContainer,
    StepHeader,
    StepTitle,
    StepDescription,
    NavigationButtons,
    NavButton
} from './GenerateCourse.styles';
import { Modal, ModalText, ModalButtonContainer, ModalButton } from '../../../components/common/Modal';
import { useTranslation } from 'react-i18next';

const LanguageSelect = styled.select`
  width: 100%;
  max-width: 400px;
  height: 56px;
  padding: 1rem;
  margin: 2rem auto 0;
  display: block;
  font-size: 1.2rem;
  border-radius: 8px;
  border: 1px solid #555;
  background-color: #33333d;
  color: white;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    height: 50px;
    margin-top: 1.5rem;
  }
`;

const languages = [
    { code: 'en', name: 'English', englishName: 'English' },
    { code: 'ar', name: 'العربية', englishName: 'Arabic' },
    { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
    { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
    { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
    { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
    { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
    { code: 'mr', name: 'मராठी', englishName: 'Marathi' },
    { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
    { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
    { code: 'ur', name: 'اردو', englishName: 'Urdu' },
];

const Step5_Language = ({ nextStep, prevStep, updateCourseData, data, isLoading, isFirstStep = false }) => {
    const [showModal, setShowModal] = useState(false);
    const [pendingLanguageChange, setPendingLanguageChange] = useState(null);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        if (pendingLanguageChange && i18n.language === pendingLanguageChange) {
            if (i18n.language !== 'en') {
                setShowModal(true);
            }
            setPendingLanguageChange(null);
        }
    }, [i18n.language, pendingLanguageChange]);

    const handleChange = (e) => {
        const langCode = e.target.value;
        const selectedLang = languages.find(l => l.code === langCode);
        
        updateCourseData({ 
            language: selectedLang.code,
            languageName: selectedLang.englishName,
            nativeName: selectedLang.name
        });

        i18n.changeLanguage(langCode);
        setPendingLanguageChange(langCode);
    };

    return (
        <>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('errors.video_language_notice_title')}>
                <ModalText>
                    {t('errors.video_language_notice_message')}
                </ModalText>
                <ModalButtonContainer>
                    <ModalButton primary onClick={() => setShowModal(false)}>{t('errors.acknowledge_button')}</ModalButton>
                </ModalButtonContainer>
            </Modal>
        
            <StepContentContainer>
                <StepHeader>
                    <StepTitle>{t('choose_language_title')}</StepTitle>
                    <StepDescription>{t('choose_language_description')}</StepDescription>
                </StepHeader>

                <LanguageSelect onChange={handleChange} value={data.language || 'en'}>
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </LanguageSelect>
                
                <NavigationButtons>
                    <NavButton onClick={prevStep} disabled={isFirstStep || isLoading}>Back</NavButton>
                    <NavButton primary onClick={nextStep} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Next'}
                    </NavButton>
                </NavigationButtons>
            </StepContentContainer>
        </>
    );
};

export default Step5_Language;
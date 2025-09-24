import React, { useState, forwardRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { FiEye, FiEyeOff, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import logo from '../../assets/seekmycourse_logo.png';
import Preloader from '../common/Preloader';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { Modal, ModalText, ModalButtonContainer, ModalButton } from '../common/Modal';

// --- Styled Components ---
const FormContainer = styled.div`
  width: 500px;
  max-width: 100%;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #2a2a38;
  border-radius: 12px;
  border: 1px solid #3c3c4c;

  // --- START: RESPONSIVE FIX ---
  @media (max-width: 768px) {
    background-color: transparent;
    border: none;
    padding: 0;
    width: 100%;
  }
  // --- END: RESPONSIVE FIX ---
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    font-size: 1rem;
    align-self: flex-start;
    margin-bottom: 1rem;
    padding: 0;
`;

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

const Logo = styled.img` width: 180px; margin-bottom: 1.5rem; `;
const Title = styled.h1` font-size: 2rem; margin-bottom: 0.5rem; color: ${({ theme }) => theme.colors.text}; text-align: center; `;
const Subtitle = styled.p` font-size: 1rem; color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 1rem; text-align: center; span { color: ${({ theme }) => theme.colors.primary}; font-weight: bold; }`;
const Form = styled.form` width: 100%; display: flex; flex-direction: column; `;
const InputGroup = styled.div` position: relative; margin-bottom: 1.5rem; width: 100%; `;
const Row = styled.div` display: flex; gap: 1rem; width: 100%; `;
const Input = styled.input` width: 100%; height: 48px; padding: 0.9rem; padding-right: ${({ hasIcon }) => (hasIcon ? '3rem' : '0.9rem')}; background-color: ${({ theme }) => theme.colors.white}; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; color: #333; box-sizing: border-box; &::placeholder { color: ${({ theme }) => theme.colors.textSecondary}; }`;
const Icon = styled.div` position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); cursor: pointer; color: ${({ theme }) => theme.colors.textSecondary}; z-index: 10; `;
const CheckboxContainer = styled.div` display: flex; align-items: center; margin-bottom: 0.5rem; `;
const Checkbox = styled.input` margin-right: 0.75rem; `;
const CheckboxLabel = styled.label` font-size: 0.875rem; color: ${({ theme }) => theme.colors.textSecondary}; a { color: ${({ theme }) => theme.colors.primary}; &:hover { text-decoration: underline; } }`;
const SignUpButton = styled.button` width: 100%; padding: 1rem; margin-top: 1rem; border: none; border-radius: 8px; background-color: ${({ theme }) => theme.colors.primary}; color: white; font-size: 1rem; font-weight: bold; cursor: pointer; transition: opacity 0.2s; &:hover { opacity: 0.9; }`;
const SignInText = styled.p` margin-top: 2rem; text-align: center; color: ${({ theme }) => theme.colors.textSecondary}; a { color: ${({ theme }) => theme.colors.primary}; font-weight: bold; }`;
const ErrorText = styled.p` color: ${({ theme }) => theme.colors.error}; font-size: 0.75rem; position: absolute; top: -1.2rem; left: 0.2rem; `;
const CheckboxErrorText = styled(ErrorText)` position: static; text-align: left; margin-bottom: 1rem; margin-top: 0.5rem; `;
const DatePickerWrapper = styled.div` width: 100%; .react-datepicker-wrapper, .react-datepicker__input-container, .react-datepicker__input-container input { width: 100%; height: 48px; display: block; }`;
const PhoneInputWrapper = styled.div` .PhoneInput { --react-phone-number-input-height: 48px; .PhoneInputInput { height: var(--react-phone-number-input-height); padding: 0.9rem; background-color: #fff; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; color: #333; box-sizing: border-box; &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; } } .PhoneInputCountry { background-color: #f0f0f0; border: 1px solid #ddd; border-right: none; border-top-left-radius: 8px; border-bottom-left-radius: 8px; height: var(--react-phone-number-input-height); display: flex; align-items: center; box-sizing: border-box; min-width: 95px; padding: 0 1rem; } .PhoneInputCountrySelectArrow { opacity: 1; color: #333; } }`;
const DatePickerCustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (<Input onClick={onClick} ref={ref} value={value} placeholder={placeholder} readOnly hasIcon />));

const RegistrationForm = ({ plan, onBack, onFormSubmit }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        reenterPassword: '',
        agreed: false,
    });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showReenterPassword, setShowReenterPassword] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalErrorMessage, setModalErrorMessage] = useState('');
    
    const { firstName, lastName, email, password, reenterPassword, agreed } = formData;

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleEmailBlur = async () => {
        if (email && !errors.email) {
            try {
                const res = await axios.post('/api/auth/check-email', { email });
                if (res.data.exists) {
                    setErrors(prev => ({ ...prev, email: t('errors.email_exists') }));
                }
            } catch (err) {
                console.error("Error checking email:", err);
            }
        }
    };

    const handlePhoneBlur = async () => {
        if (phoneNumber && !errors.phoneNumber) {
            try {
                const res = await axios.post('/api/auth/check-phone', { phoneNumber });
                if (res.data.exists) {
                    setErrors(prev => ({ ...prev, phoneNumber: t('errors.phone_exists') }));
                }
            } catch (err) {
                 console.error("Error checking phone:", err);
            }
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!firstName.trim()) newErrors.firstName = t('errors.first_name_required');
        else if (!lastName.trim()) newErrors.lastName = t('errors.last_name_required');
        else if (!email.trim()) newErrors.email = t('errors.email_required');
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('errors.email_invalid');
        else if (!phoneNumber) newErrors.phoneNumber = t('errors.phone_required');
        else if (!dateOfBirth) newErrors.dateOfBirth = t('errors.dob_required');
        else if (!password) newErrors.password = t('errors.password_required');
        else if (password.length < 6) newErrors.password = t('errors.password_min_length');
        else if (password !== reenterPassword) newErrors.reenterPassword = t('errors.passwords_no_match');
        else if (!agreed) newErrors.agreed = t('errors.terms_required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsLoading(true);
        const finalData = { 
            ...formData, 
            phoneNumber, 
            dateOfBirth,
            planId: plan._id 
        };
        
        try {
            const res = await axios.post('/api/auth/register', finalData);
            navigate('/verify-phone', { state: { email: res.data.email, phone: res.data.phone } });
        } catch (err) {
            const errorKey = err.response?.data?.msgKey || 'errors.generic';
            const translatedError = t(errorKey);
            
            if (errorKey === 'errors.phone_fraudulent') {
                setModalErrorMessage(translatedError);
                setShowErrorModal(true);
            } else {
                setErrors({ email: translatedError }); // Show generic errors near email field
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <FormContainer>
            {isLoading && <Preloader />}
            <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={t('errors.phone_invalid')}>
                <FiAlertTriangle size={40} color="#d95c03" style={{ marginBottom: '1rem' }} />
                <ModalText>{modalErrorMessage}</ModalText>
                <ModalButtonContainer>
                    <ModalButton primary onClick={() => setShowErrorModal(false)}>OK</ModalButton>
                </ModalButtonContainer>
            </Modal>
            
            <BackButton onClick={onBack}>&larr; Back to Plans</BackButton>
            <Logo src={logo} alt="SeekMYCOURSE Logo" />
            <Title>{t('create_account')}</Title>
            <Subtitle>You have selected the <span>{plan.name}</span> plan.</Subtitle>
            
            <Form onSubmit={handleSubmit}>
                <LanguageSwitcher variant="form" />
                <Row>
                    <InputGroup>
                        {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
                        <Input type="text" name="firstName" placeholder={t('first_name')} value={firstName} onChange={onChange} />
                    </InputGroup>
                    <InputGroup>
                        {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
                        <Input type="text" name="lastName" placeholder={t('last_name')} value={lastName} onChange={onChange} />
                    </InputGroup>
                </Row>
                <InputGroup>
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                    <Input type="email" name="email" placeholder={t('email_placeholder')} value={email} onChange={onChange} onBlur={handleEmailBlur} />
                </InputGroup>
                <InputGroup>
                    {errors.phoneNumber && <ErrorText>{errors.phoneNumber}</ErrorText>}
                    <PhoneInputWrapper>
                        <PhoneInput placeholder={t('phone_number')} value={phoneNumber} onChange={setPhoneNumber} onBlur={handlePhoneBlur} defaultCountry="IN" international />
                    </PhoneInputWrapper>
                </InputGroup>
                <InputGroup>
                    {errors.dateOfBirth && <ErrorText>{errors.dateOfBirth}</ErrorText>}
                    <DatePickerWrapper>
                        <DatePicker selected={dateOfBirth} onChange={(date) => setDateOfBirth(date)} dateFormat="dd/MM/yyyy" showYearDropdown showMonthDropdown dropdownMode="select" maxDate={new Date()} placeholderText={t('dob')} customInput={<DatePickerCustomInput />} />
                    </DatePickerWrapper>
                    <Icon><FiCalendar /></Icon>
                </InputGroup>
                <InputGroup>
                    {errors.password && <ErrorText>{errors.password}</ErrorText>}
                    <Input type={showPassword ? 'text' : 'password'} name="password" placeholder={t('password_placeholder')} value={password} onChange={onChange} hasIcon />
                    <Icon onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</Icon>
                </InputGroup>
                <InputGroup>
                    {errors.reenterPassword && <ErrorText>{errors.reenterPassword}</ErrorText>}
                    <Input type={showReenterPassword ? 'text' : 'password'} name="reenterPassword" placeholder={t('re_enter_password')} value={reenterPassword} onChange={onChange} hasIcon />
                    <Icon onClick={() => setShowReenterPassword(!showReenterPassword)}>{showReenterPassword ? <FiEyeOff /> : <FiEye />}</Icon>
                </InputGroup>
                <CheckboxContainer>
                    <Checkbox type="checkbox" name="agreed" checked={agreed} onChange={onChange} />
                    <CheckboxLabel>
                        <Trans i18nKey="agree_terms">
                            I agree to the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a> & <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        </Trans>
                    </CheckboxLabel>
                </CheckboxContainer>
                {errors.agreed && <CheckboxErrorText>{errors.agreed}</CheckboxErrorText>}
                <SignUpButton type="submit">{t('signup_and_verify')}</SignUpButton>
            </Form>
            <SignInText>
                <Trans i18nKey="log_in_prompt">
                    Already have an account? <Link to="/login">Sign In</Link>
                </Trans>
            </SignInText>
            <FooterText>
                    <p>Having trouble signing up? <a href="mailto:support@seekmycourse.com">support@seekmycourse.com</a></p>
                    <p>&copy; {new Date().getFullYear()} SeekMyCourse AI Technologies Pvt Ltd.</p>
                </FooterText>
        </FormContainer>
    );
};

export default RegistrationForm;
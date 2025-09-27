import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logo from '../assets/seekmycourse_logo.png';
import Preloader from '../components/common/Preloader';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// --- Styled Components (No changes needed here) ---
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const VerificationBox = styled.div`
  width: 450px;
  padding: 3rem;
  background-color: #33333d;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Logo = styled.img`
  width: 150px;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  span {
    font-weight: bold;
    color: white;
  }
`;

const OtpInput = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  background-color: #2c2f48;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
  margin: 1.5rem 0;
  box-sizing: border-box;
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const ResendText = styled.p`
  margin-top: 1.5rem;
  color: #aaa;
  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    font-weight: bold;
    &:disabled {
      color: #777;
      cursor: not-allowed;
    }
  }
`;

const NotificationText = styled.p`
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
    background-color: ${props => props.type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
`;

const ChangeLink = styled.span`
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    margin-bottom: 1rem;
    text-decoration: underline;
`;

const ChangeNumberView = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    .PhoneInput {
        width: 100%;
        input {
            width: 100%;
            padding: 0.75rem;
            background-color: #2c2f48;
            border: 1px solid #444;
            border-radius: 6px;
            color: white;
            box-sizing: border-box;
        }
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    width: 100%;
`;
// --- Component ---
const VerifyPhonePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ text: '', type: '' });
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isChangingNumber, setIsChangingNumber] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');

    const initialEmail = location.state?.email;
    const initialPhone = location.state?.phone;

    const [currentPhone, setCurrentPhone] = useState(initialPhone);

    useEffect(() => {
        if (!initialEmail || !initialPhone) {
            navigate('/signup');
        }
    }, [initialEmail, initialPhone, navigate]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const showNotification = (text, type = 'error') => {
        setNotification({ text, type });
        setTimeout(() => setNotification({ text: '', type: '' }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-signup-phone', {
                phoneNumber: currentPhone,
                otp: otp
            });
            showNotification(response.data.msg, 'success');
            navigate('/verify-email', { state: { email: initialEmail } });
        } catch (err) {
            showNotification(err.response?.data?.msg || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setIsLoading(true);
        try {
            await axios.post('/api/auth/resend-signup-phone-otp', {
                phoneNumber: currentPhone
            });
            showNotification('A new OTP has been sent.', 'success');
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeNumber = async () => {
        setIsLoading(true);
        try {
            await axios.post('/api/auth/change-signup-phone', {
                oldPhoneNumber: currentPhone,
                newPhoneNumber: newPhoneNumber,
                email: initialEmail
            });
            setCurrentPhone(newPhoneNumber);
            setIsChangingNumber(false);
            showNotification('OTP sent to new number.', 'success');
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Failed to change number.');
        } finally {
            setIsLoading(false);
        }
    };


    if (isChangingNumber) {
        return (
            <PageContainer>
                <VerificationBox>
                    <Logo src={logo} alt="Logo" />
                    <Title>{t('change_phone_title')}</Title>
                    {notification.text && <NotificationText type={notification.type}>{notification.text}</NotificationText>}
                    <ChangeNumberView>
                         <PhoneInput
                            international
                            defaultCountry="US"
                            value={newPhoneNumber}
                            onChange={setNewPhoneNumber}
                            className="phone-input-field"
                        />
                        <ButtonGroup>
                             <VerifyButton onClick={() => setIsChangingNumber(false)} style={{backgroundColor: '#555'}}>
                                {t('cancel_button')}
                            </VerifyButton>
                            <VerifyButton onClick={handleChangeNumber} disabled={isLoading || !newPhoneNumber}>
                                {isLoading ? t('sending_button') : t('send_otp_button')}
                            </VerifyButton>
                        </ButtonGroup>
                    </ChangeNumberView>
                </VerificationBox>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            {isLoading && <Preloader />}
            <VerificationBox>
                <Logo src={logo} alt="Logo" />
                <Title>{t('verify_phone_title')}</Title>
                {notification.text && <NotificationText type={notification.type}>{notification.text}</NotificationText>}
                <Subtitle>
                    {t('verify_phone_intro')}
                    <br />
                    <span>{currentPhone}</span>
                </Subtitle>
                <ChangeLink onClick={() => setIsChangingNumber(true)}>{t('change_number_link')}</ChangeLink>
                <form onSubmit={handleSubmit} style={{width: '100%'}}>
                    <OtpInput
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <VerifyButton type="submit">{t('verify_button')}</VerifyButton>
                </form>
                <ResendText>
                    {t('resend_prompt')}{' '}
                    <button onClick={handleResend} disabled={!canResend}>
                        {canResend ? t('resend_button') : t('resend_timer', { seconds: timer })}
                    </button>
                </ResendText>
            </VerificationBox>
        </PageContainer>
    );
};

export default VerifyPhonePage;
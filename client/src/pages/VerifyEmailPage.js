import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import logo from '../assets/seekmycourse_logo.png';
import Preloader from '../components/common/Preloader';
import paymentService from '../services/paymentService';

// --- Styled Components (No changes needed here) ---
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const VerificationBox = styled.div`
  width: 400px;
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
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  span {
    color: ${({ theme }) => theme.colors.white};
    font-weight: bold;
  }
`;

const OtpInput = styled.input`
  width: 200px;
  padding: 1rem;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
`;

const ResendText = styled.p`
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  button {
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0;
    &:disabled {
      color: ${({ theme }) => theme.colors.textSecondary};
      cursor: not-allowed;
    }
  }
`;

const NotificationText = styled.div`
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  width: 100%;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: ${({ type }) => (type === 'error' ? '#581b1b' : '#03453f')};
  color: ${({ type, theme }) => (type === 'error' ? theme.colors.error : theme.colors.primary)};
  border: 1px solid ${({ type, theme }) => (type === 'error' ? theme.colors.error : theme.colors.primary)};
  box-sizing: border-box;
`;


const VerifyEmailPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [otp, setOtp] = useState('');
    const [currentEmail, setCurrentEmail] = useState(state?.email || '');
    const [currentPhone, setCurrentPhone] = useState(state?.phone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ type: '', text: '' });
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    };

    useEffect(() => {
        if (!state?.email || !state?.phone) {
            navigate('/signup');
        }
        loadRazorpayScript();
    }, [state, navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        if (timer === 0) {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // --- FIX: This function now accepts the token from the previous step ---
    const handlePayment = async (token) => {
        setIsLoading(true);
        setNotification({ type: 'success', text: 'Verification successful! Preparing payment...' });
        try {
            // --- FIX: Pass the token to the payment service ---
            const orderResponse = await paymentService.createOrder(token);
            const order = orderResponse.data;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "SeekMYCOURSE",
                description: "Subscription Activation",
                order_id: order.id,
                handler: async (response) => {
                    setNotification({ type: 'success', text: 'Payment successful! Finalizing your account...' });
                    const paymentData = { ...response, email: currentEmail };
                    
                    try {
                        const verifyRes = await paymentService.verifyPayment(paymentData);
                        
                        if (verifyRes.data && verifyRes.data.token) {
                            localStorage.setItem('token', verifyRes.data.token);
                            navigate('/dashboard');
                        } else {
                            throw new Error("Login token not received from server.");
                        }

                    } catch (verifyError) {
                        console.error("Payment Verification Error:", verifyError);
                        setNotification({ type: 'error', text: 'Could not finalize your account. Please contact support.' });
                        setIsLoading(false);
                    }
                },
                prefill: { 
                    email: currentEmail,
                    contact: currentPhone 
                },
                theme: { color: "#03AC9A" },
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();
            setIsLoading(false);

        } catch (err) {
            console.error("Create Order Error:", err);
            setNotification({ type: 'error', text: 'Could not initiate payment. Please try again.' });
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification({ type: '', text: '' });
        try {
            // --- FIX: Capture the response from the server ---
            const res = await axios.post('/api/auth/verify-signup-email', { email: currentEmail, otp });
            
            // --- FIX: Extract the token and pass it to handlePayment ---
            const token = res.data.token;
            if (token) {
                handlePayment(token);
            } else {
                throw new Error("Token not received after email verification.");
            }

        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Verification failed. Please try again.';
            setNotification({ type: 'error', text: t(errorMsg) });
            setIsLoading(false);
        }
    };
    const handleResend = async () => {
        if (!canResend) return;
        setIsLoading(true);
        setNotification({ type: '', text: '' });
        try {
            await axios.post('/api/auth/resend-signup-email-otp', { email: currentEmail });
            setNotification({ type: 'success', text: t('otp_resent_success') });
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Failed to resend OTP.';
            setNotification({ type: 'error', text: t(errorMsg) });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <PageContainer>
            {isLoading && <Preloader />}
            <VerificationBox>
                <Logo src={logo} alt="Logo" />
                <Title>{t('verify_email_title')}</Title>
                {notification.text && <NotificationText type={notification.type}>{notification.text}</NotificationText>}
                <Subtitle>
                    {t('verify_email_intro')}
                    <br />
                    <span>{currentEmail}</span>
                </Subtitle>
                <form onSubmit={handleSubmit} style={{width: '100%'}}>
                    <OtpInput 
                        type="text" 
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <VerifyButton type="submit">{t('verify_and_proceed_payment')}</VerifyButton>
                </form>
                 <ResendText>
                    {t('spam_prompt')}{' '}
                    <button onClick={handleResend} disabled={!canResend}>
                        {canResend ? t('resend_button') : t('resend_timer', { seconds: timer })}
                    </button>
                </ResendText>
            </VerificationBox>
        </PageContainer>
    );
};

export default VerifyEmailPage;
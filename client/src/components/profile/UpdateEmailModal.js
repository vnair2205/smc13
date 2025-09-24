// client/src/components/profile/UpdateEmailModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Modal } from '../common/Modal'; // Using your existing base Modal

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2c2f48;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;

const Button = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#555')};
  color: ${({ theme, primary }) => (primary ? '#1e1e2d' : 'white')};
  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.p`
  color: ${({ type }) => (type === 'error' ? '#F44336' : '#4CAF50')};
  margin: 0;
  min-height: 20px;
`;

const ResendText = styled.p`
    color: #aaa;
    font-size: 0.9rem;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    text-decoration: ${({ disabled }) => (disabled ? 'none' : 'underline')};
    opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const SuccessIcon = styled.div`
    font-size: 3rem;
    color: #4CAF50;
`;


const UpdateEmailModal = ({ isOpen, onClose, currentUserEmail, onUpdateSuccess }) => {
    const [step, setStep] = useState('enterEmail'); // enterEmail, enterOtp, success
    const [newEmail, setNewEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [timer, setTimer] = useState(60);
    const token = localStorage.getItem('token');

    // Timer effect for resend OTP
    useEffect(() => {
        let interval;
        if (step === 'enterOtp' && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleClose = () => {
        // Reset state on close
        setStep('enterEmail');
        setNewEmail('');
        setOtp('');
        setStatus({ message: '', type: '' });
        setIsLoading(false);
        setTimer(60);
        onClose();
    };
    
    // Step 1: Send OTP to the new email
    const handleSendOtp = async () => {
        setIsLoading(true);
        setStatus({ message: '', type: '' });
        try {
            await axios.post('/api/auth/update-email', 
                { oldEmail: currentUserEmail, newEmail }, 
                { headers: { 'x-auth-token': token } }
            );
            setStep('enterOtp');
            setTimer(60); // Reset timer
        } catch (err) {
            setStatus({ message: err.response?.data?.msg || 'An error occurred.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify the OTP
    const handleVerifyOtp = async () => {
        setIsLoading(true);
        setStatus({ message: '', type: '' });
        try {
            await axios.post('/api/auth/verify-email', 
                { email: newEmail, otp }, 
                { headers: { 'x-auth-token': token } }
            );
            setStep('success');
        } catch (err) {
            setStatus({ message: err.response?.data?.msg || 'Invalid OTP.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSuccess = () => {
        onUpdateSuccess(); // This will refetch data on the main page
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>
                {step === 'enterEmail' && (
                    <>
                        <h2>Enter New Email Address</h2>
                        <StatusMessage type={status.type}>{status.message}</StatusMessage>
                        <Input type="email" placeholder="new.email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                        <ButtonGroup>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button primary onClick={handleSendOtp} disabled={isLoading || !newEmail}>
                                {isLoading ? 'Sending...' : 'Next'}
                            </Button>
                        </ButtonGroup>
                    </>
                )}

                {step === 'enterOtp' && (
                    <>
                        <h2>Verify Your New Email</h2>
                        <p>An OTP has been sent to <strong>{newEmail}</strong>.</p>
                        <StatusMessage type={status.type}>{status.message}</StatusMessage>
                        <Input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" />
                        <ResendText disabled={timer > 0} onClick={timer === 0 ? handleSendOtp : null}>
                            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                        </ResendText>
                        <ButtonGroup>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button primary onClick={handleVerifyOtp} disabled={isLoading || otp.length < 6}>
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </Button>
                        </ButtonGroup>
                    </>
                )}

                {step === 'success' && (
                    <>
                        <SuccessIcon>✓</SuccessIcon>
                        <h2>Success!</h2>
                        <p>Your email has been updated successfully.</p>
                        <ButtonGroup>
                           <Button primary onClick={handleSuccess}>Done</Button>
                        </ButtonGroup>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default UpdateEmailModal;
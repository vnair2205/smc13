// client/src/components/profile/UpdatePhoneModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Modal } from '../common/Modal';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; // Import stylesheet

// Styled components
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


const UpdatePhoneModal = ({ isOpen, onClose, onUpdateSuccess }) => {
    const [step, setStep] = useState('enterPhone'); // enterPhone, enterOtp, success
    const [newPhone, setNewPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const [timer, setTimer] = useState(60);
    const token = localStorage.getItem('token');

    useEffect(() => {
        let interval;
        if (step === 'enterOtp' && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleClose = () => {
        setStep('enterPhone');
        setNewPhone('');
        setOtp('');
        setStatus({ message: '', type: '' });
        setIsLoading(false);
        setTimer(60);
        onClose();
    };

    const handleSendOtp = async () => {
        setIsLoading(true);
        setStatus({ message: '', type: '' });
        try {
            await axios.post('/api/auth/update-phone', 
                { newPhoneNumber: newPhone }, 
                { headers: { 'x-auth-token': token } }
            );
            setStep('enterOtp');
            setTimer(60);
        } catch (err) {
            setStatus({ message: err.response?.data?.msg || 'An error occurred.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        setStatus({ message: '', type: '' });
        try {
            await axios.post('/api/auth/verify-phone', 
                { otp }, 
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
        onUpdateSuccess();
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>
                {step === 'enterPhone' && (
                    <>
                        <h2>Enter New Phone Number</h2>
                        <StatusMessage type={status.type}>{status.message}</StatusMessage>
                        <PhoneInput
                            international
                            defaultCountry="IN"
                            value={newPhone}
                            onChange={setNewPhone}
                        />
                        <ButtonGroup>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button primary onClick={handleSendOtp} disabled={isLoading || !newPhone}>
                                {isLoading ? 'Sending...' : 'Next'}
                            </Button>
                        </ButtonGroup>
                    </>
                )}
                
                {step === 'enterOtp' && (
                    <>
                        <h2>Verify Your New Phone Number</h2>
                        <p>An OTP has been sent to <strong>{newPhone}</strong>.</p>
                        <StatusMessage type={status.type}>{status.message}</StatusMessage>
                        <Input 
                            type="text" 
                            placeholder="Enter 4-digit OTP" // FIX 1: Changed placeholder
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            maxLength="4" // FIX 2: Changed maxLength
                        />
                        <ResendText disabled={timer > 0} onClick={timer === 0 ? handleSendOtp : null}>
                            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                        </ResendText>
                        <ButtonGroup>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button 
                                primary 
                                onClick={handleVerifyOtp} 
                                disabled={isLoading || otp.length < 4} // FIX 3: Changed length check
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </Button>
                        </ButtonGroup>
                    </>
                )}
    
                {step === 'success' && (
                    <>
                        <SuccessIcon>✓</SuccessIcon>
                        <h2>Success!</h2>
                        <p>Your phone number has been updated successfully.</p>
                        <ButtonGroup>
                            <Button primary onClick={handleSuccess}>Done</Button>
                        </ButtonGroup>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default UpdatePhoneModal;
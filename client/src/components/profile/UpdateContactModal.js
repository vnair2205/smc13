import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Modal } from '../common/Modal';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2c2f48;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
`;

const Button = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #1e1e2d;
  cursor: pointer;
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.p`
  color: ${({ type }) => (type === 'error' ? '#F44336' : '#4CAF50')};
`;

const UpdateContactModal = ({ isOpen, onClose, contactType, userEmail, onUpdate }) => {
    const [step, setStep] = useState(1); // 1: Enter new value, 2: Enter OTP
    const [newValue, setNewValue] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });
    const token = localStorage.getItem('token');

    const handleSendOtp = async () => {
        setLoading(true);
        setStatus({ message: '', type: '' });
        const endpoint = contactType === 'email' ? '/api/auth/update-email' : '/api/auth/update-phone';
        const payload = contactType === 'email'
            ? { oldEmail: userEmail, newEmail: newValue }
            : { email: userEmail, newPhoneNumber: newValue };

        try {
            await axios.post(endpoint, payload, { headers: { 'x-auth-token': token } });
            setStatus({ message: `OTP sent to ${newValue}`, type: 'success' });
            setStep(2);
        } catch (err) {
            setStatus({ message: err.response?.data?.msg || 'Failed to send OTP.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        setStatus({ message: '', type: '' });
        const endpoint = contactType === 'email' ? '/api/auth/verify-email' : '/api/auth/verify-phone';
        const payload = contactType === 'email'
            ? { email: newValue, otp }
            : { email: userEmail, otp, newPhoneNumber: newValue };
            
        try {
            await axios.post(endpoint, payload, { headers: { 'x-auth-token': token } });
            setStatus({ message: `${contactType.charAt(0).toUpperCase() + contactType.slice(1)} updated successfully!`, type: 'success' });
            setTimeout(() => {
                onUpdate(); // Refetch user data
                onClose(); // Close modal
            }, 1500);
        } catch (err) {
            setStatus({ message: err.response?.data?.msg || 'Invalid OTP.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <h2>Update {contactType}</h2>
                {status.message && <StatusMessage type={status.type}>{status.message}</StatusMessage>}

                {step === 1 && (
                    <>
                        <Input
                            type={contactType === 'email' ? 'email' : 'tel'}
                            placeholder={`Enter new ${contactType}`}
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                        />
                        <Button onClick={handleSendOtp} disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button onClick={handleVerifyOtp} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Update'}
                        </Button>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default UpdateContactModal;
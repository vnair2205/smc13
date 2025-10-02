import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Modal from '../common/Modal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #555;
  border-radius: 8px;
  background-color: #33333d;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PasswordToggleIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const StyledButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UpdateButton = styled(StyledButton)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const CloseButton = styled(StyledButton)`
  background-color: #555;
  color: white;
`;

const Message = styled.p`
    font-size: 0.9rem;
    text-align: center;
    margin-top: -0.5rem;
    margin-bottom: 0.5rem;
`;

const ErrorMessage = styled(Message)`
    color: ${({ theme }) => theme.colors.danger};
`;

const SuccessMessage = styled(Message)`
    color: ${({ theme }) => theme.colors.success};
`;


const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleClose = () => {
        resetForm();
        setError('');
        setSuccess('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post('/api/profile/change-password', { currentPassword, newPassword }, config);
            
            setSuccess(res.data.msg || 'Password updated successfully!');
            resetForm();

        } catch (err) {
            setError(err.response?.data?.msg || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
            <form onSubmit={handleSubmit}>
                <ModalContent>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {success && <SuccessMessage>{success}</SuccessMessage>}
                    
                    <InputGroup>
                        <Input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <PasswordToggleIcon onClick={() => setShowCurrent(!showCurrent)}>
                            {showCurrent ? <FaEyeSlash /> : <FaEye />}
                        </PasswordToggleIcon>
                    </InputGroup>
                    <InputGroup>
                        <Input
                            type={showNew ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <PasswordToggleIcon onClick={() => setShowNew(!showNew)}>
                            {showNew ? <FaEyeSlash /> : <FaEye />}
                        </PasswordToggleIcon>
                    </InputGroup>
                    <InputGroup>
                        <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <PasswordToggleIcon onClick={() => setShowConfirm(!showConfirm)}>
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                        </PasswordToggleIcon>
                    </InputGroup>
                    <ButtonContainer>
                        <CloseButton type="button" onClick={handleClose}>Close</CloseButton>
                        <UpdateButton type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update'}
                        </UpdateButton>
                    </ButtonContainer>
                </ModalContent>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
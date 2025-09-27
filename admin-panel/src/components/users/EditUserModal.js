import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const FormGroup = styled.div`
    label {
        display: block;
        margin-bottom: 0.5rem;
        color: ${({ theme }) => theme.colors.textSecondary};
    }
    input {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid #33333e;
        background-color: #1e1e32;
        color: white;
        font-size: 1rem;
    }
`;

const ActionButton = styled.button`
  background-color: #5e72e4;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  &:hover {
    background-color: #485cc7;
  }
`;

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({ email: '', phoneNumber: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user._id, formData);
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Edit User Details</h2>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </FormGroup>
                <ActionButton type="submit">Save Changes</ActionButton>
            </Form>
        </Modal>
    );
};

export default EditUserModal;
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
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                addressLine1: user.billingAddress?.addressLine1 || '',
                addressLine2: user.billingAddress?.addressLine2 || '',
                city: user.billingAddress?.city || '',
                state: user.billingAddress?.state || '',
                country: user.billingAddress?.country || '',
                postalCode: user.billingAddress?.postalCode || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Structure the data correctly for the backend
        const dataToSave = {
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            billingAddress: {
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                postalCode: formData.postalCode,
            }
        };
        onSave(user._id, dataToSave);
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Edit User Details</h2>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </FormGroup> {/* <-- This was the typo: </FormGrup> is now corrected to </FormGroup> */}
                <hr />
                <h4>Billing Address</h4>
                <FormGroup>
                    <label htmlFor="addressLine1">Address Line 1</label>
                    <input type="text" id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="addressLine2">Address Line 2</label>
                    <input type="text" id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="city">City</label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="state">State / Province</label>
                    <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} />
                </FormGroup>
                 <FormGroup>
                    <label htmlFor="country">Country</label>
                    <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="postalCode">Postal Code</label>
                    <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                </FormGroup>
                <ActionButton type="submit">Save Changes</ActionButton>
            </Form>
        </Modal>
    );
};

export default EditUserModal;
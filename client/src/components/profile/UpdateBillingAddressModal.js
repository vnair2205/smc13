// client/src/components/profile/UpdateBillingAddressModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';

// --- STYLED COMPONENTS ---
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #ccc;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2c2f48;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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

// A self-contained dropdown for Indian states
const IndianStatesDropdown = ({ value, onChange }) => {
    const states = [ 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry' ];
    return (
        <select value={value} name="state" onChange={onChange} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2c2f48', border: '1px solid #444', borderRadius: '6px', color: 'white' }}>
            <option value="">Select State</option>
            {states.map(state => <option key={state} value={state}>{state}</option>)}
        </select>
    );
};


// --- COMPONENT ---
const UpdateBillingAddressModal = ({ isOpen, onClose, currentAddress, onSave }) => {
    const [address, setAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentAddress) {
            setAddress(currentAddress);
        }
    }, [currentAddress]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(address);
        setIsSaving(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <h2>Update Billing Address</h2>
                <FormGroup>
                    <Label>Address Line 1</Label>
                    <Input name="addressLine1" value={address.addressLine1} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>Address Line 2</Label>
                    <Input name="addressLine2" value={address.addressLine2} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>City</Label>
                    <Input name="city" value={address.city} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>State</Label>
                    <IndianStatesDropdown value={address.state} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>Pin Code</Label>
                    <Input name="zipCode" value={address.zipCode} onChange={handleChange} />
                </FormGroup>
                <ButtonGroup>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button primary onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </ButtonGroup>
            </ModalContent>
        </Modal>
    );
};

export default UpdateBillingAddressModal;
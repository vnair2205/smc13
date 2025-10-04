import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';
import institutePlanService from '../../services/institutePlanService';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 1rem; // For scrollbar spacing
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FullWidthFormGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const FormSectionTitle = styled.h3`
    grid-column: 1 / -1;
    margin-top: 1rem;
    margin-bottom: -0.5rem;
    color: ${({ theme }) => theme.colors.primary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 0.5rem;
`;

const Label = styled.label`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
    padding: 0.8rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
    padding: 0.8rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
`;

const ButtonGroup = styled.div`
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid transparent;
  font-weight: bold;

  &.primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &.secondary {
    background-color: #6c757d;
    color: white;
  }
`;


const AddInstituteModal = ({ isOpen, onClose, onSave }) => {
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({
        instituteName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pinCode: '',
        institutePhoneNumber: '',
        instituteEmail: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: '',
        planId: '',
    });

    useEffect(() => {
        const fetchPlans = async () => {
            if (isOpen) {
                try {
                    const { data } = await institutePlanService.getPlans();
                    setPlans(data);
                } catch (error) {
                    console.error("Failed to fetch plans", error);
                }
            }
        };
        fetchPlans();
    }, [isOpen]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Institute">
            <Form onSubmit={handleSubmit}>
                <FormSectionTitle>Institute Details</FormSectionTitle>

                <FullWidthFormGroup>
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input id="instituteName" name="instituteName" type="text" onChange={handleChange} required />
                </FullWidthFormGroup>

                <FormGroup>
                    <Label htmlFor="instituteEmail">Institute Email</Label>
                    <Input id="instituteEmail" name="instituteEmail" type="email" onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="institutePhoneNumber">Institute Phone Number</Label>
                    <Input id="institutePhoneNumber" name="institutePhoneNumber" type="tel" onChange={handleChange} required />
                </FormGroup>

                <FullWidthFormGroup>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input id="addressLine1" name="addressLine1" type="text" onChange={handleChange} required />
                </FullWidthFormGroup>

                <FullWidthFormGroup>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input id="addressLine2" name="addressLine2" type="text" onChange={handleChange} />
                </FullWidthFormGroup>

                <FormGroup>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" type="text" onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" type="text" onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="pinCode">Pin Code</Label>
                    <Input id="pinCode" name="pinCode" type="text" onChange={handleChange} required />
                </FormGroup>


                <FormSectionTitle>Admin User Details</FormSectionTitle>

                <FormGroup>
                    <Label htmlFor="adminFirstName">Admin First Name</Label>
                    <Input id="adminFirstName" name="adminFirstName" type="text" onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="adminLastName">Admin Last Name</Label>
                    <Input id="adminLastName" name="adminLastName" type="text" onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input id="adminEmail" name="adminEmail" type="email" onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <Input id="adminPassword" name="adminPassword" type="password" onChange={handleChange} required />
                </FormGroup>


                <FullWidthFormGroup>
                    <Label htmlFor="planId">Select Plan</Label>
                    <Select id="planId" name="planId" value={formData.planId} onChange={handleChange} required>
                        <option value="">-- Select a Plan --</option>
                        {plans.map(plan => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
                    </Select>
                </FullWidthFormGroup>

                <ButtonGroup>
                    <Button type="button" className="secondary" onClick={onClose}>Close</Button>
                    <Button type="submit" className="primary">Save Institute</Button>
                </ButtonGroup>
            </Form>
        </Modal>
    );
};

export default AddInstituteModal;
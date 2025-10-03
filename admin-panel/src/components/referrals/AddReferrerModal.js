import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';
import subscriptionService from '../../services/subscriptionService';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const AddReferrerModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    planId: '',
    discountAmount: '',
  });
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchPlans = async () => {
        try {
          // --- START: FIX ---
          // 1. Call the correct function: getAllPlans()
          // 2. Access the data from the response object: res.data
          const res = await subscriptionService.getAllPlans();
setPlans(res.data || []);
          // --- END: FIX ---
        } catch (error) {
          console.error("Failed to fetch subscription plans", error);
        }
      };
      fetchPlans();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Referrer">
      <Form onSubmit={handleSubmit}>
        <Input name="firstName" placeholder="First Name" onChange={handleChange} required />
        <Input name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <Input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
        <Input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />
        <Select name="planId" onChange={handleChange} value={formData.planId} required>
          <option value="">Select a Plan</option>
          {plans.map(plan => (
            <option key={plan._id} value={plan._id}>{plan.name} - ₹{plan.amount}</option>
          ))}
        </Select>
        <Input type="number" name="discountAmount" placeholder="Discounted Price (e.g., 150)" onChange={handleChange} required />
        <Button type="submit">Create Referral</Button>
      </Form>
    </Modal>
  );
};

export default AddReferrerModal;
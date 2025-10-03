// admin-panel/src/components/subscriptions/AddEditPlanModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid transparent;

  &.primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
  &.secondary {
    background-color: #6c757d;
    color: white;
  }
`;

const AddEditPlanModal = ({ isOpen, onClose, onSave, planData }) => {
  // --- FIX: Removed 'razorpayPlanId' from the initial state ---
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    coursesPerMonth: '',
    subtopicsPerCourse: '5',
    isPublic: true,
  });

  useEffect(() => {
    if (planData) {
      // --- FIX: Removed 'razorpayPlanId' from the state when editing ---
      setFormData({
        name: planData.name || '',
        amount: planData.amount || '',
        coursesPerMonth: planData.coursesPerMonth || '',
        subtopicsPerCourse: planData.subtopicsPerCourse || '5',
        isPublic: planData.isPublic === false ? false : true,
      });
    } else {
      // --- FIX: Removed 'razorpayPlanId' when resetting for a new plan ---
      setFormData({
        name: '',
        amount: '',
        coursesPerMonth: '',
        subtopicsPerCourse: '5',
        isPublic: true,
      });
    }
  }, [planData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'isPublic' ? (value === 'true') : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={planData ? 'Edit Plan' : 'Add New Plan'}>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Plan Name</Label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="amount">Plan Amount (INR)</Label>
          <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="coursesPerMonth">Courses per Month</Label>
          <Input id="coursesPerMonth" name="coursesPerMonth" type="number" value={formData.coursesPerMonth} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="subtopicsPerCourse">Subtopics per Course</Label>
          <Select id="subtopicsPerCourse" name="subtopicsPerCourse" value={formData.subtopicsPerCourse} onChange={handleChange}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </Select>
        </FormGroup>

        {/* --- FIX: This entire FormGroup has been removed ---
        <FormGroup>
          <Label htmlFor="razorpayPlanId">Razorpay Plan ID</Label>
          <Input id="razorpayPlanId" name="razorpayPlanId" type="text" value={formData.razorpayPlanId} onChange={handleChange} required />
        </FormGroup>
        */}

        <FormGroup>
          <Label htmlFor="isPublic">Plan Visibility</Label>
          <Select id="isPublic" name="isPublic" value={formData.isPublic} onChange={handleChange}>
            <option value="true">Public</option>
            <option value="false">Private</option>
          </Select>
        </FormGroup>

        <ButtonGroup>
          <Button type="button" className="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="primary">Save Plan</Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

export default AddEditPlanModal;
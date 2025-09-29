import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';

// ... (Keep all your styled components as they are)

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

const AddEditInstitutePlanModal = ({ isOpen, onClose, onSave, planData }) => {
    const [formData, setFormData] = useState({
        name: '',
        duration: 'Monthly',
        adminCoursesPerMonth: '',
        userCoursesPerMonth: '',
    });

    useEffect(() => {
        if (planData) {
            setFormData(planData);
        } else {
            setFormData({
                name: '',
                duration: 'Monthly',
                adminCoursesPerMonth: '',
                userCoursesPerMonth: '',
            });
        }
    }, [planData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={planData ? "Edit Institutional Plan" : "Add Institutional Plan"}>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="name">Plan Name</Label>
                    <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="duration">Plan Duration</Label>
                    <Select id="duration" name="duration" value={formData.duration} onChange={handleChange}>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Semi-Annually">Semi-Annually</option>
                        <option value="Annually">Annually</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="adminCoursesPerMonth">Admin Courses Per Month</Label>
                    <Input id="adminCoursesPerMonth" name="adminCoursesPerMonth" type="number" value={formData.adminCoursesPerMonth} onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="userCoursesPerMonth">User Courses Per Month</Label>
                    <Input id="userCoursesPerMonth" name="userCoursesPerMonth" type="number" value={formData.userCoursesPerMonth} onChange={handleChange} required />
                </FormGroup>

                <ButtonGroup>
                    <Button type="button" className="secondary" onClick={onClose}>Close</Button>
                    <Button type="submit" className="primary">Save</Button>
                </ButtonGroup>
            </Form>
        </Modal>
    );
};

export default AddEditInstitutePlanModal;
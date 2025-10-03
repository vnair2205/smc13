import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Import eye icons
import Modal from '../common/Modal';
import subscriptionService from '../../services/subscriptionService';

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

// --- FIX: Updated Input styling to use theme colors ---
const Input = styled.input`
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor || '#444'};
  background-color: ${({ theme }) => theme.colors.inputBackground || '#2c2f48'};
  color: ${({ theme }) => theme.colors.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

// --- FIX: Updated Select styling to use theme colors ---
const Select = styled.select`
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor || '#444'};
  background-color: ${({ theme }) => theme.colors.inputBackground || '#2c2f48'};
  color: ${({ theme }) => theme.colors.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

// --- START: NEW COMPONENTS for password visibility ---
const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled(Input)`
  width: 100%;
  padding-right: 2.5rem; /* Space for the icon */
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
// --- END: NEW COMPONENTS ---

const ButtonGroup = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  border: none;

  &.primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &.secondary {
    background-color: ${({ theme }) => theme.colors.secondary || '#6c757d'};
    color: white;
  }
`;

const AddEditReferrerModal = ({ isOpen, onClose, onSave, referrerData }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '', email: '', password: '', planId: '',
    });
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    useEffect(() => {
        if (referrerData) {
            setFormData({
                firstName: referrerData.firstName || '',
                lastName: referrerData.lastName || '',
                phone: referrerData.phone || '',
                email: referrerData.email || '',
                password: '',
                planId: referrerData.plan?._id || '',
            });
        } else {
            setFormData({
                firstName: '', lastName: '', phone: '', email: '', password: '', planId: '',
            });
        }
    }, [referrerData, isOpen]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // --- FIX: Changed to getAllPlans to fetch all plans for the admin ---
                const response = await subscriptionService.getAllPlans();
                const plans = response.data; // Axios wraps the response in a data object
                
                if (Array.isArray(plans)) {
                    setSubscriptionPlans(plans);
                } else {
                    console.error("Fetched plans is not an array:", plans);
                    setSubscriptionPlans([]);
                }
            } catch (error) {
                console.error("Failed to fetch subscription plans", error);
                setSubscriptionPlans([]);
            }
        };

        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, _id: referrerData?._id });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={referrerData ? 'Edit Referrer' : 'Add New Referrer'}
        >
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </FormGroup>
                
                {/* --- FIX: Implemented password visibility toggle --- */}
                <FormGroup>
                    <Label htmlFor="password">Password</Label>
                    <PasswordWrapper>
                        <PasswordInput 
                            id="password" 
                            name="password" 
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder={referrerData ? "Leave blank to keep unchanged" : ""} 
                            required={!referrerData} 
                        />
                        <PasswordToggleButton type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </PasswordToggleButton>
                    </PasswordWrapper>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="planId">Subscription Plan</Label>
                    <Select id="planId" name="planId" value={formData.planId} onChange={handleChange} required>
                        <option value="">Select a Plan</option>
                        {subscriptionPlans.map(plan => (
                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                        ))}
                    </Select>
                </FormGroup>

                <ButtonGroup>
                    <Button type="button" className="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="primary">Save</Button>
                </ButtonGroup>
            </Form>
        </Modal>
    );
};

export default AddEditReferrerModal;
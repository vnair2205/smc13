import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { addTestUser, getSubscriptionPlans } from '../../services/testUserService';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const AddTestUserModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', plan: '' });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await getSubscriptionPlans();
                setPlans(response.data);
            } catch (error) {
                console.error('Error fetching plans:', error);
            }
        };
        fetchPlans();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await addTestUser({ ...formData, phoneNumber });
            onSave();
            onClose();
        } catch (error) {
            console.error('Error adding test user:', error);
        }
    };

    return (
        // --- FIX: Pass the title as a prop and remove the h2 tag below ---
        <Modal title="Add Test User" onClose={onClose}>
            <input name="firstName" placeholder="First Name" onChange={handleChange} />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <PhoneInput
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={setPhoneNumber}
            />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} />
            <select name="plan" onChange={handleChange}>
                <option value="">Select a Plan</option>
                {plans.map(plan => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
            </select>
            <button onClick={handleSubmit}>Save</button>
        </Modal>
    );
};

export default AddTestUserModal;
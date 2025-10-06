import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { updateTestUser, getSubscriptionPlans } from '../../services/testUserService';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

const EditTestUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email, plan: user.plan._id });
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const fetchPlans = async () => {
            const response = await getSubscriptionPlans();
            setPlans(response.data);
        };
        fetchPlans();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await updateTestUser(user._id, { ...formData, phoneNumber });
            onSave();
            onClose();
        } catch (error) {
            console.error('Error updating test user:', error);
        }
    };

    return (
        <Modal onClose={onClose}>
            <h2>Edit Test User</h2>
            <input name="firstName" value={formData.firstName} placeholder="First Name" onChange={handleChange} />
            <input name="lastName" value={formData.lastName} placeholder="Last Name" onChange={handleChange} />
            <input name="email" value={formData.email} placeholder="Email" onChange={handleChange} />
            <PhoneInput
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={setPhoneNumber}/>
            <select name="plan" value={formData.plan} onChange={handleChange}>
                {plans.map(plan => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
            </select>
            <button onClick={handleSubmit}>Save</button>
        </Modal>
    );
};

export default EditTestUserModal;
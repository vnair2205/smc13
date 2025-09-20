// client/src/components/subscriptions/UpgradeModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PlanSelection from '../signup/PlanSelection';
import { Modal, ModalTitle } from '../common/Modal';

const ModalContentWrapper = styled.div`
  padding: 1rem;
  width: 100%;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

// --- NEW HELPER FUNCTION TO LOAD SCRIPT ---
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


const UpgradeModal = ({ isOpen, onClose, onUpgradeSuccess }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/profile');
                setUser(res.data);
            } catch (err) {
                console.error("Could not fetch user profile", err);
            }
        };

        const fetchPlans = async () => {
            setLoading(true);
            try {
                await loadRazorpayScript(); // Load the script when modal opens
                const res = await api.get('/subscriptions/public');
                setPlans(res.data);
                setError('');
            } catch (err) {
                setError('Could not load subscription plans. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchUserData();
            fetchPlans();
        }
    }, [isOpen]);

    const handlePlanSelect = async (plan) => {
        if (!user) {
            setError("User data not loaded. Cannot proceed with payment.");
            return;
        }

        try {
            const { data } = await api.post('/payments/create-order', { planId: plan._id });
            const order = data.order; // Access the nested order object

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'SeekMyCourse',
                description: `Upgrade to ${plan.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await api.post('/payments/verify-upgrade', { ...response, planId: plan._id });
                        onUpgradeSuccess();
                        onClose();
                        navigate('/dashboard'); // Redirect to dashboard on success

                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                        console.error("Payment verification error:", err.response.data);
                    }
                },
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    contact: user.phoneNumber,
                },
                theme: {
                    color: '#03d9c5',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            // --- FIX: LOG THE SPECIFIC BACKEND ERROR ---
            setError('Could not create a payment order. Please try again.');
            console.error("Create order API error:", err.response ? err.response.data : err.message);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal onClose={onClose} isOpen={isOpen} maxWidth="1100px">
            <ModalContentWrapper>
                <ModalTitle>Choose a New Plan</ModalTitle>
                {loading && <p>Loading plans...</p>}
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {!loading && !error && (
                    <PlanSelection
                        plans={plans}
                        onSelect={handlePlanSelect}
                        buttonText="Select Plan"
                        showTitle={false} 
                    />
                )}
            </ModalContentWrapper>
        </Modal>
    );
};

export default UpgradeModal;
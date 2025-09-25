// admin-panel/src/pages/SubscriptionPlansPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import subscriptionService from '../services/subscriptionService';
import SubscriptionPlanCard from '../components/subscriptions/SubscriptionPlanCard';
import AddEditPlanModal from '../components/subscriptions/AddEditPlanModal';
import { FiPlus } from 'react-icons/fi';

const PageWrapper = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const SubscriptionPlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const response = await subscriptionService.getPlans();
            setPlans(response.data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleOpenModal = (plan = null) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleSavePlan = async (planData) => {
        try {
            if (editingPlan) {
                await subscriptionService.updatePlan(editingPlan._id, planData);
            } else {
                await subscriptionService.addPlan(planData);
            }
            fetchPlans(); // Refresh the list
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save plan", error);
        }
    };
   const handleDeletePlan = async (planId) => {
        if (window.confirm('Are you sure you want to deactivate this plan? This will make it unavailable for new subscriptions.')) {
            try {
                // --- FIX: Use the response data to update the plans list ---
                const response = await subscriptionService.deletePlan(planId);
                setPlans(response.data); 
            } catch (error) {
                console.error("Failed to delete plan", error);
                // Optionally, add a user-friendly error message here
            }
        }
    };


    return (
        <PageWrapper>
            <Header>
                <Title>Subscription Plans</Title>
                <Actions>
                    <Button onClick={() => handleOpenModal()}>
                        <FiPlus />
                        Add Plan
                    </Button>
                    {/* Placeholder for future functionality */}
                    <Button style={{ backgroundColor: '#6c757d' }} onClick={() => alert('Add User to Plan - Coming soon!')}>
                        Add User to Plan
                    </Button>
                </Actions>
            </Header>
            {isLoading ? (
                <p>Loading plans...</p>
            ) : (
                <PlansGrid>
                    {plans.map((plan) => (
                        <SubscriptionPlanCard
                            key={plan._id}
                            plan={plan}
                            onEdit={() => handleOpenModal(plan)}
                            onDelete={() => handleDeletePlan(plan._id)}
                        />
                    ))}
                </PlansGrid>
            )}

            {isModalOpen && (
                <AddEditPlanModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSavePlan}
                    planData={editingPlan}
                />
            )}
        </PageWrapper>
    );
};

export default SubscriptionPlansPage;
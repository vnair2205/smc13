import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import institutePlanService from '../services/institutePlanService';
import AddEditInstitutePlanModal from '../components/subscriptions/AddEditInstitutePlanModal';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

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

// --- STYLING FIX ---
const PlanCard = styled.div`
    background: #1e1e2d; /* Dark background */
    color: #fff; /* Light text */
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
`;

const PlanName = styled.h3`
    font-size: 1.5rem;
    margin-bottom: 1rem;
`;

const PlanDetail = styled.p`
    font-size: 1rem;
    margin-bottom: 0.5rem;
`;

const CardActions = styled.div`
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 1.2rem;

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }
`;


const InstitutionalSubscriptionPlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const fetchPlans = async () => {
        try {
            const { data } = await institutePlanService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error('Error fetching institutional plans:', error);
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
        setEditingPlan(null);
        setIsModalOpen(false);
    };

    const handleSavePlan = async (planData) => {
        try {
            if (editingPlan) {
                // Update existing plan
                await institutePlanService.updatePlan(editingPlan._id, planData);
            } else {
                // Create new plan
                await institutePlanService.createPlan(planData);
            }
            fetchPlans(); // Refresh the plans list
            handleCloseModal();
        } catch (error) {
            console.error('Error saving institutional plan:', error);
        }
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await institutePlanService.deletePlan(planId);
                fetchPlans(); // Refresh the plans list
            } catch (error) {
                console.error('Error deleting institutional plan:', error);
            }
        }
    };

    return (
        <PageWrapper>
            <Header>
                <Title>Institutional Subscription Plans</Title>
                <Button onClick={() => handleOpenModal()}>
                    <FiPlus />
                    Add Plan
                </Button>
            </Header>
            {isLoading ? (
                <p>Loading plans...</p>
            ) : (
                <PlansGrid>
                    {plans.map((plan) => (
                        <PlanCard key={plan._id}>
                            <PlanName>{plan.name}</PlanName>
                            <PlanDetail><strong>Duration:</strong> {plan.duration}</PlanDetail>
                            <PlanDetail><strong>Admin Courses:</strong> {plan.adminCoursesPerMonth}/month</PlanDetail>
                            <PlanDetail><strong>User Courses:</strong> {plan.userCoursesPerMonth}/month</PlanDetail>
                            <CardActions>
                                <ActionButton onClick={() => handleOpenModal(plan)}><FiEdit /></ActionButton>
                                <ActionButton onClick={() => handleDeletePlan(plan._id)}><FiTrash2 /></ActionButton>
                            </CardActions>
                        </PlanCard>
                    ))}
                </PlansGrid>
            )}

            {isModalOpen && (
                <AddEditInstitutePlanModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSavePlan}
                    planData={editingPlan}
                />
            )}
        </PageWrapper>
    );
};

export default InstitutionalSubscriptionPlansPage;
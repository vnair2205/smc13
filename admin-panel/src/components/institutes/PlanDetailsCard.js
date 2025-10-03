import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEdit } from 'react-icons/fi';
import institutePlanService from '../../services/institutePlanService';
import Modal from '../common/Modal'; // Assuming you have a generic Modal component

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const Button = styled.button`
  /* ... your standard button styles ... */
`;

const PlanDetailsCard = ({ institute }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(institute.plan._id);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await institutePlanService.getAllPlans();
      setPlans(data);
    };
    fetchPlans();
  }, []);

  const calculateExpiry = () => {
    const planDuration = institute.plan.duration; // e.g., 'monthly', 'yearly'
    const startDate = new Date(institute.createdAt);
    if (planDuration === 'monthly') {
      startDate.setMonth(startDate.getMonth() + 1);
    } else if (planDuration === 'yearly') {
      startDate.setFullYear(startDate.getFullYear() + 1);
    } // ... add logic for quarterly, etc.
    return startDate.toLocaleDateString();
  };

  const handlePlanChange = async () => {
    // --- API call to update the institute's plan ---
    console.log("Changing plan to:", selectedPlan);
    setIsModalOpen(false);
  };

  return (
    <Card>
      <CardTitle>Plan Details</CardTitle>
      <InfoRow>
        <span>Current Plan:</span>
        <strong>{institute.plan.name}</strong>
      </InfoRow>
      <InfoRow>
        <span>Expires On:</span>
        <strong>{calculateExpiry()}</strong>
      </InfoRow>
      <Button onClick={() => setIsModalOpen(true)}><FiEdit /> Change Plan</Button>

      {isModalOpen && (
        <Modal title="Change Plan" onClose={() => setIsModalOpen(false)}>
          <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
            {plans.map(plan => (
              <option key={plan._id} value={plan._id}>{plan.name}</option>
            ))}
          </select>
          <Button onClick={handlePlanChange}>Save Changes</Button>
        </Modal>
      )}
    </Card>
  );
};

export default PlanDetailsCard;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEdit } from 'react-icons/fi';
import { format } from 'date-fns';
import institutePlanService from '../../services/institutePlanService';
import instituteService from '../../services/instituteService';
import Modal from '../common/Modal';

// --- Styled Components ---
const Card = styled.div`
    background-color: ${({ theme }) => theme.colors.lightBackground};
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    height: 100%;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
`;

const Button = styled.button`
    padding: 0.6rem 1.2rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover { opacity: 0.9; }
`;

const PlanInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const InfoItem = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    span:first-child {
        color: ${({ theme }) => theme.colors.textSecondary};
    }
    span:last-child {
        font-weight: 600;
    }
`;

const PlanList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 0.5rem;
`;

const PlanOption = styled.label`
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid ${({ theme, isSelected }) => isSelected ? theme.colors.primary : theme.colors.border};
    border-radius: 8px;
    cursor: pointer;
    background-color: ${({ theme, isSelected }) => isSelected ? 'rgba(71, 93, 224, 0.1)' : 'transparent'};
    
    input {
        margin-right: 1rem;
    }
`;


// --- Utility Function ---
const calculateExpiryDate = (startDate, planDuration) => {
    if (!startDate || !planDuration) return 'N/A';
    const date = new Date(startDate);
    switch (planDuration) {
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'semi-annually':
            date.setMonth(date.getMonth() + 6);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            return 'N/A';
    }
    return format(date, 'PPP');
};

// --- Component ---
const PlanCard = ({ institute, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allPlans, setAllPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(institute.plan?._id);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data } = await institutePlanService.getAllPlans();
                setAllPlans(data);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            }
        };
        if (isModalOpen) {
            fetchPlans();
        }
    }, [isModalOpen]);

    const handlePlanChange = async () => {
        try {
            await instituteService.updateInstitutePlan(institute._id, selectedPlanId);
            onUpdate(); // This will refetch all institute data on the parent page
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update plan", error);
        }
    };

    const expiryDate = calculateExpiryDate(institute.createdAt, institute.plan?.duration);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <Button onClick={() => setIsModalOpen(true)}><FiEdit /> Change Plan</Button>
                </CardHeader>
                <PlanInfo>
                    <InfoItem>
                        <span>Plan Name:</span>
                        <span>{institute.plan?.name || 'N/A'}</span>
                    </InfoItem>
                    <InfoItem>
                        <span>Plan Expiry:</span>
                        <span>{expiryDate}</span>
                    </InfoItem>
                </PlanInfo>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Change Subscription Plan"
                onSave={handlePlanChange}
                saveText="Save Changes"
            >
                <PlanList>
                    {allPlans.map(plan => (
                        <PlanOption key={plan._id} isSelected={selectedPlanId === plan._id}>
                            <input
                                type="radio"
                                name="plan"
                                value={plan._id}
                                checked={selectedPlanId === plan._id}
                                onChange={() => setSelectedPlanId(plan._id)}
                            />
                            <div>
                                <strong>{plan.name}</strong> - ${plan.price}/{plan.duration}
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#888' }}>
                                    {/* --- THIS IS THE FIX --- */}
                                    {plan.features && Array.isArray(plan.features) ? plan.features.join(', ') : ''}
                                </p>
                            </div>
                        </PlanOption>
                    ))}
                </PlanList>
            </Modal>
        </>
    );
};

export default PlanCard;
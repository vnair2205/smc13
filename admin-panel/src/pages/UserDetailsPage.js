import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
// --- FIX: Added all necessary icons ---
import { FaUserEdit, FaHistory, FaPlusCircle, FaFileInvoice, FaEdit, FaMapMarkerAlt, FaLightbulb, FaBullseye, FaStar, FaTools, FaLaptopCode, FaChartLine } from 'react-icons/fa';
import { getUserDetails, changeUserPlan, addCourseCount, updateUserDetails } from '../services/userService';
import subscriptionService from '../services/subscriptionService';
import Preloader from '../components/common/Preloader';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import InvoiceModal from '../components/subscriptions/InvoiceModal';
import EditUserModal from '../components/users/EditUserModal';

// --- Styled Components (remain the same) ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Header = styled.h1`
  margin-bottom: 2rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
`;

const CardBody = styled.div`
  flex-grow: 1;
`;

const CardTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #33333e;
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionButton = styled.button`
  background-color: #5e72e4;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  &:hover {
    background-color: #485cc7;
  }
`;

const ViewInvoiceButton = styled.button`
    background: none;
    border: none;
    color: #5e72e4;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    &:hover {
        color: #485cc7;
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #33333e;
    background-color: #1e1e32;
    color: white;
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid #33333e;
  margin: 1.5rem 0;
`;


const UserDetailsPage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlanModalOpen, setPlanModalOpen] = useState(false);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const fetchUserDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUserDetails(userId);
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    const handleOpenPlanModal = async () => {
        try {
            const response = await subscriptionService.getAllPlans();
            setPlans(response.data);
            setSelectedPlan('');
            setPlanModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };
    
    const handleChangePlan = async () => {
        if (!selectedPlan) return alert('Please select a plan.');
        try {
            await changeUserPlan(userId, selectedPlan);
            setPlanModalOpen(false);
            fetchUserDetails();
        } catch (error) {
            console.error("Failed to change plan", error);
        }
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setInvoiceModalOpen(true);
    };
    
    const handleSaveUser = async (userId, data) => {
        try {
            await updateUserDetails(userId, data);
            setEditModalOpen(false);
            fetchUserDetails();
        } catch (error) {
            console.error('Failed to update user', error);
            alert('Error updating user.');
        }
    };

    const subscriptionHistoryColumns = [
        { title: 'Invoice #', key: 'subscriptionId', render: (row) => `#${row.subscriptionId}` },
        { title: 'Plan Name', key: 'plan.name' },
        { title: 'Subscription Date', key: 'startDate', render: (row) => new Date(row.startDate).toLocaleDateString() },
        { title: 'Next Renewal Date', key: 'endDate', render: (row) => new Date(row.endDate).toLocaleDateString() },
        { title: 'Transaction ID', key: 'razorpay_payment_id', render: (row) => row.razorpay_payment_id.startsWith('admin_') ? 'Admin Assigned' : row.razorpay_payment_id },
        {
            title: 'Invoice',
            key: 'actions',
            render: (row) => (
                <ViewInvoiceButton onClick={() => handleViewInvoice(row)}>
                    <FaFileInvoice /> View
                </ViewInvoiceButton>
            ),
        },
    ];

    if (loading) return <Preloader />;
    if (!user) return <PageContainer><h1>User Not Found</h1></PageContainer>;

    const { activeSubscription, subscriptionHistory, billingAddress, learnsProfile } = user;

    return (
        <PageContainer>
            <Header>User Profile: {user.firstName} {user.lastName}</Header>
            
            <GridContainer>
                {/* User Details Card */}
                <Card>
                    <CardTitle>
                        <FaUserEdit /> User Information
                        <FaEdit onClick={() => setEditModalOpen(true)} style={{ cursor: 'pointer', marginLeft: 'auto' }} />
                    </CardTitle>
                    <CardBody>
                        <InfoRow><InfoLabel>Email:</InfoLabel> <span>{user.email || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Phone:</InfoLabel> <span>{user.phoneNumber || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Account Status:</InfoLabel> <span>{user.status || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Joined:</InfoLabel> <span>{new Date(user.createdAt).toLocaleDateString()}</span></InfoRow>
                        
                        <SectionDivider />
                        
                        <CardTitle><FaMapMarkerAlt /> Billing Address</CardTitle>
                        <InfoRow><InfoLabel>Address:</InfoLabel> <span>{billingAddress?.addressLine1 || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>City:</InfoLabel> <span>{billingAddress?.city || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Country:</InfoLabel> <span>{billingAddress?.country || 'N/A'}</span></InfoRow>
                        
                        <SectionDivider />
                        
                        {/* --- FIX: Added all missing Learns Profile fields --- */}
                        <CardTitle><FaLightbulb /> Learns Profile</CardTitle>
                        <InfoRow><InfoLabel><FaStar /> Experience Level:</InfoLabel> <span>{learnsProfile?.experienceLevel || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel><FaBullseye /> Learning Goals:</InfoLabel> <span>{learnsProfile?.learningGoals?.join(', ') || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel><FaLaptopCode /> Areas of Interest:</InfoLabel> <span>{learnsProfile?.areasOfInterest?.join(', ') || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel><FaChartLine /> New Skill Targets:</InfoLabel> <span>{learnsProfile?.newSkillTargets?.join(', ') || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel><FaTools /> Resource Needs:</InfoLabel> <span>{learnsProfile?.resourceNeeds?.join(', ') || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Preferred Language:</InfoLabel> <span>{learnsProfile?.language || 'N/A'}</span></InfoRow>
                    </CardBody>
                </Card>
                
                {/* Active Subscription Card */}
                <Card>
                    <CardTitle><FaPlusCircle /> Active Subscription</CardTitle>
                    {activeSubscription ? (
                        <>
                            <InfoRow><InfoLabel>Plan:</InfoLabel> <span>{activeSubscription.plan?.name || 'N/A'}</span></InfoRow>
                            <InfoRow><InfoLabel>Status:</InfoLabel> <span>{activeSubscription.status}</span></InfoRow>
                            <InfoRow><InfoLabel>Expires On:</InfoLabel> <span>{new Date(activeSubscription.endDate).toLocaleDateString()}</span></InfoRow>
                            <InfoRow><InfoLabel>Courses Left:</InfoLabel> <span>{user.coursesRemaining} / {activeSubscription.plan?.coursesPerMonth}</span></InfoRow>
                            <ActionButton onClick={handleOpenPlanModal}>Change Plan</ActionButton>
                        </>
                    ) : (
                        <>
                          <p>No active subscription.</p>
                          <ActionButton onClick={handleOpenPlanModal}>Assign New Plan</ActionButton>
                        </>
                    )}
                </Card>
            </GridContainer>

            {/* Subscription History Table */}
            <Card>
                <CardTitle><FaHistory /> Subscription History</CardTitle>
                {subscriptionHistory && subscriptionHistory.length > 0 ? (
                    <DataTable columns={subscriptionHistoryColumns} data={subscriptionHistory} />
                ) : (
                    <p>No subscription history found.</p>
                )}
            </Card>

            {/* Modals */}
            <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} invoiceDetails={selectedInvoice} userDetails={user} />
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={user} onSave={handleSaveUser} />
            
            <Modal isOpen={isPlanModalOpen} onClose={() => setPlanModalOpen(false)}>
                <h2>Change Subscription Plan</h2>
                <select onChange={(e) => setSelectedPlan(e.target.value)} defaultValue="">
                    <option value="" disabled>Select a new plan</option>
                    {plans.map(plan => (
                        <option key={plan._id} value={plan._id}>{plan.name} ({plan.coursesPerMonth} Courses/Month)</option>
                    ))}
                </select>
                <ActionButton onClick={handleChangePlan}>Confirm Change</ActionButton>
            </Modal>
        </PageContainer>
    );
};

export default UserDetailsPage;
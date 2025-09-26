import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserEdit, FaHistory, FaPlusCircle, FaFileInvoice, FaEdit } from 'react-icons/fa';
import { getUserDetails, changeUserPlan, addCourseCount, updateUserDetails } from '../services/userService';
import subscriptionService from '../services/subscriptionService';
import Preloader from '../components/common/Preloader';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import InvoiceModal from '../components/subscriptions/InvoiceModal';
import { updateUserStatus } from '../services/userService'; 
import EditUserModal from '../components/users/EditUserModal';
import { useNavigate } from 'react-router-dom';

// --- Styled Components ---
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
  flex-grow: 1; /* This is the key change */
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
const CardFooter = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #33333e;
`;
const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #33333e;
    background-color: #1e1e32;
    color: white;
`;

const UserDetailsPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlanModalOpen, setPlanModalOpen] = useState(false);
    const [isCourseModalOpen, setCourseModalOpen] = useState(false);
    const [isInvoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [additionalCourses, setAdditionalCourses] = useState(1);
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
        if (!selectedPlan) {
            alert('Please select a plan.');
            return;
        }
        try {
            await changeUserPlan(userId, selectedPlan);
            setPlanModalOpen(false);
            fetchUserDetails(); // Refresh user data
        } catch (error) {
            console.error("Failed to change plan", error);
        }
    };

    const handleAddCourses = async () => {
        try {
            await addCourseCount(userId, additionalCourses);
            setCourseModalOpen(false);
            fetchUserDetails(); // Refresh user data
        } catch (error) {
            console.error("Failed to add courses", error);
        }
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setInvoiceModalOpen(true);
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

    const handleSaveUser = async (userId, data) => {
        try {
            // You need a service function for this. Let's assume it's called 'updateUserDetails'
            // For now, let's use the existing 'updateUserStatus' as a placeholder for the API call structure.
            // You should create a dedicated `updateUserDetails` in `userService.js`
            await updateUserStatus(userId, data);
            setEditModalOpen(false);
            fetchUserDetails(); // Refresh data
        } catch (error) {
            console.error('Failed to update user', error);
            alert('Error updating user.');
        }
    };

    const { activeSubscription, subscriptionHistory } = user;

    return (
        <PageContainer>
            <Header>User Profile: {user.firstName} {user.lastName}</Header>
            
            <GridContainer>
                {/* User Details Card */}
                <Card>
                     <CardTitle>
                    <FaUserEdit /> User Information
                    <FaEdit 
                        onClick={() => setEditModalOpen(true)} 
                        style={{ cursor: 'pointer', marginLeft: 'auto', marginRight: '1rem' }} 
                    />
                </CardTitle>
                    {/* 👇 FIX: Restored the missing user info rows */}
                                        <CardBody>
                        <InfoRow><InfoLabel>Email:</InfoLabel> <span>{user.email || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Phone:</InfoLabel> <span>{user.phoneNumber || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Account Status:</InfoLabel> <span>{user.status || 'N/A'}</span></InfoRow>
                        <InfoRow><InfoLabel>Joined:</InfoLabel> <span>{new Date(user.createdAt).toLocaleDateString()}</span></InfoRow>
                    </CardBody>

                <CardFooter>
                        <ActionButton onClick={() => navigate(`/user/${user._id}/courses`)}>
                            View Courses
                        </ActionButton>
                    </CardFooter>
                </Card>
                

                {/* Active Subscription Card */}
                <Card>
                    <CardTitle><FaPlusCircle /> Active Subscription</CardTitle>
                    {/* 👇 FIX: Restored the missing active subscription details */}
                    {activeSubscription ? (
                        <>
                            <InfoRow><InfoLabel>Plan:</InfoLabel> <span>{activeSubscription.plan?.name || 'N/A'}</span></InfoRow>
                            <InfoRow><InfoLabel>Status:</InfoLabel> <span>{activeSubscription.status}</span></InfoRow>
                            <InfoRow><InfoLabel>Expires On:</InfoLabel> <span>{new Date(activeSubscription.endDate).toLocaleDateString()}</span></InfoRow>
                            <InfoRow><InfoLabel>Courses Left:</InfoLabel> <span>{user.coursesRemaining} / {activeSubscription.plan?.coursesPerMonth}</span></InfoRow>
                            <ActionButton onClick={handleOpenPlanModal}>Change Plan</ActionButton>
                            <ActionButton onClick={() => setCourseModalOpen(true)} style={{ marginLeft: '1rem' }}>Add Courses</ActionButton>
                        </>
                    ) : (
                        <>
                          <p>No active subscription.</p>
                          <ActionButton onClick={handleOpenPlanModal}>Assign New Plan</ActionButton>
                            <ActionButton onClick={() => navigate(`/user/${user._id}/courses`)}>
                    View Courses
                </ActionButton>
                        </>
                    )}
                </Card>
            </GridContainer>

            {/* Subscription History Table */}
            <Card>
                <CardTitle><FaHistory /> Subscription History</CardTitle>
                {subscriptionHistory && subscriptionHistory.length > 0 ? (
                    <DataTable 
                        columns={subscriptionHistoryColumns} 
                        data={subscriptionHistory} 
                    />
                ) : (
                    <p>No subscription history found.</p>
                )}
            </Card>

            {/* Modals */}
            <InvoiceModal 
                isOpen={isInvoiceModalOpen} 
                onClose={() => setInvoiceModalOpen(false)} 
                invoiceDetails={selectedInvoice}
                userDetails={user}
            />
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={user}
                onSave={handleSaveUser}
            />
            
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

            <Modal isOpen={isCourseModalOpen} onClose={() => setCourseModalOpen(false)}>
                <h2>Add Course Generations</h2>
                <Input
                    type="number"
                    value={additionalCourses}
                    onChange={(e) => setAdditionalCourses(Number(e.target.value))}
                    min="1"
                />
                <ActionButton onClick={handleAddCourses}>Add to Quota</ActionButton>
            </Modal>
        </PageContainer>
    );
};

export default UserDetailsPage;
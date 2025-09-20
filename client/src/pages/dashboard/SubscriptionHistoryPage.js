// client/src/pages/dashboard/SubscriptionHistoryPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';
import InvoiceModal from '../../components/subscriptions/InvoiceModal';
import UpgradeModal from '../../components/subscriptions/UpgradeModal'; // --- IMPORT THE NEW MODAL ---

// --- STYLED COMPONENTS (No changes needed) ---
const PageWrapper = styled.div`
    padding: 2rem;
    font-family: sans-serif;
`;
const Header = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 2rem;
`;
const CardsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
`;
const InfoCard = styled.div`
    background-color: #2a2a3e;
    padding: 1.5rem;
    border-radius: 10px;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;
const CardTitle = styled.h3`
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #a9a9c8;
    font-weight: 500;
`;
const CardValue = styled.p`
    margin: 0;
    font-size: 1.75rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;
// --- UPDATED BUTTON ---
const UpgradeButton = styled.button`
    background-color: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
    width: 100%; /* Make button fill the card */
    height: 100%;

    &:hover {
        background-color: ${({ theme }) => theme.colors.primaryHover};
    }
`;
const ControlsWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;
const FilterWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;
const StyledSelect = styled.select`
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 1px solid #4a4a6a;
    background-color: #2a2a3e;
    color: #fff;
    font-size: 1rem;
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
const PaginationWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;
const PaginationButton = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: 1px solid #4a4a6a;
    background-color: #2a2a3e;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.2s;
    &:disabled { background-color: #333; color: #777; cursor: not-allowed; }
    &:not(:disabled):hover { background-color: ${({ theme }) => theme.colors.primary}; }
`;
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: #2a2a3e;
    color: #fff;
    border-radius: 10px;
    overflow: hidden;
    th, td { padding: 1rem; text-align: left; }
    th { background-color: #3b3b58; }
    tbody tr { border-bottom: 1px solid #3b3b58; }
    tbody tr:last-child { border-bottom: none; }
`;
const ViewButton = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border-radius: 5px;
    cursor: pointer;
`;

// --- MAIN COMPONENT ---

const SubscriptionHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false); // --- STATE FOR MODAL ---
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchSubscriptionData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/subscriptions/history?page=${currentPage}&limit=${itemsPerPage}`);
            setHistory(response.data.subscriptions);
            setCurrentPlan(response.data.currentPlan);
            setTotalItems(response.data.totalSubscriptions);
        } catch (error) {
            console.error("Failed to fetch subscription history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionData();
    }, [currentPage, itemsPerPage]);

    const handleUpgradeSuccess = () => {
        // Refetch data to show the new plan immediately
        fetchSubscriptionData();
    };

    const handleViewInvoice = (invoiceId) => {
        const invoice = history.find(sub => sub._id === invoiceId);
        setSelectedInvoice(invoice);
    };
    
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    if (loading) {
        return <PageWrapper>Loading...</PageWrapper>;
    }

    return (
        <PageWrapper>
            <Header>Subscription</Header>

            <CardsContainer>
                <InfoCard>
                    <CardTitle>Current Plan</CardTitle>
                    <CardValue>{currentPlan ? currentPlan.name : 'No Active Plan'}</CardValue>
                </InfoCard>
                <InfoCard>
                    <CardTitle>Next Renewal Date</CardTitle>
                    <CardValue>{currentPlan ? new Date(currentPlan.endDate).toLocaleDateString() : 'N/A'}</CardValue>
                </InfoCard>
                <InfoCard>
                    {/* --- UPDATE BUTTON TEXT AND ONCLICK HANDLER --- */}
                    <UpgradeButton onClick={() => setIsUpgradeModalOpen(true)}>
                        Upgrade Plan
                    </UpgradeButton>
                </InfoCard>
            </CardsContainer>

            <Header>Billing History</Header>

            <ControlsWrapper>
                <FilterWrapper>
                    <StyledSelect>
                        <option>Newest to Oldest</option>
                        <option>Oldest to Newest</option>
                    </StyledSelect>
                </FilterWrapper>
                <PaginationWrapper>
                    <StyledSelect value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={30}>30 per page</option>
                    </StyledSelect>
                    <PaginationButton onClick={handlePrevPage} disabled={currentPage === 1}>Previous</PaginationButton>
                    <span>Page {currentPage} of {totalPages}</span>
                    <PaginationButton onClick={handleNextPage} disabled={currentPage === totalPages}>Next</PaginationButton>
                </PaginationWrapper>
            </ControlsWrapper>
            
            <Table>
                <thead>
                    <tr>
                        <th>Invoice #</th><th>Plan Name</th><th>Subscription Date</th><th>Next Renewal Date</th><th>Transaction ID</th><th>Invoice</th>
                    </tr>
                </thead>
                <tbody>
                    {history && history.map((sub) => (
                        <tr key={sub._id}>
                            <td>SMC-{(sub.subscriptionId || 0) + 1000}</td>
                            <td>{sub.plan ? sub.plan.name : 'N/A'}</td>
                            <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                            <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                            <td>{sub.razorpay_payment_id || 'N/A'}</td>
                            <td><ViewButton onClick={() => handleViewInvoice(sub._id)}>View Invoice</ViewButton></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            {selectedInvoice && (<InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />)}
            
            {/* --- ADD THE UPGRADE MODAL COMPONENT --- */}
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onUpgradeSuccess={handleUpgradeSuccess}
            />
        </PageWrapper>
    );
};

export default SubscriptionHistoryPage;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import InvoiceModal from '../../components/subscriptions/InvoiceModal';

const PageWrapper = styled.div`
    padding: 2rem;
`;

const Header = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
`;

const SummarySection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
    background-color: #33333d;
    padding: 1.5rem;
    border-radius: 8px;
`;

const CardTitle = styled.h3`
    margin-top: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
`;

const CardValue = styled.p`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;

const FilterSection = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: center;
`;

const FilterInput = styled.input`
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
`;

const FilterSelect = styled.select`
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th, td {
        padding: 1rem;
        border-bottom: 1px solid #444;
        text-align: left;
    }
`;

const ViewButton = styled.button`
    padding: 0.5rem 1rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const SubscriptionHistoryPage = () => {
    const [currentPlan, setCurrentPlan] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    // --- FIX: Add missing state for sort and date filters ---
    const [sort, setSort] = useState('newest');
    const [date, setDate] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/subscriptions/history', {
                    params: { sort, date } // Pass state to API
                });
                setCurrentPlan(res.data.currentPlan);
                setHistory(res.data.history);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, [sort, date]); // Re-run effect when sort or date changes

    const handleViewInvoice = async (id) => {
        try {
            const res = await axios.get(`/api/subscriptions/invoice/${id}`);
            setSelectedInvoice(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <PageWrapper>
            <Header>Subscription History</Header>
            {currentPlan && (
                <SummarySection>
                    <SummaryCard>
                        <CardTitle>Current Plan</CardTitle>
                        <CardValue>{currentPlan.name}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                        <CardTitle>Courses Generated This Month</CardTitle>
                        <CardValue>{currentPlan.coursesGenerated} / {currentPlan.totalCourses}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                        <CardTitle>Next Renewal Date</CardTitle>
                        <CardValue>{new Date(currentPlan.endDate).toLocaleDateString()}</CardValue>
                    </SummaryCard>
                </SummarySection>
            )}

            <FilterSection>
                <label>Sort by:</label>
                <FilterSelect value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </FilterSelect>
                <label>Filter by Date:</label>
                <FilterInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FilterSection>

            <Table>
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Plan Name</th>
                        <th>Subscription Date</th>
                        <th>Next Renewal Date</th>
                        <th>Transaction ID</th>
                        <th>Invoice</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((sub) => (
                        <tr key={sub._id}>
                            <td>SMC-{(sub.subscriptionId || 0) + 1000}</td>
                            <td>{sub.plan.name}</td>
                            <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                            <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                            <td>{sub.razorpay_payment_id}</td>
                            <td>
                                <ViewButton onClick={() => handleViewInvoice(sub._id)}>
                                    View Invoice
                                </ViewButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            {selectedInvoice && (
                <InvoiceModal 
                    invoice={selectedInvoice} 
                    onClose={() => setSelectedInvoice(null)} 
                />
            )}
        </PageWrapper>
    );
};

export default SubscriptionHistoryPage;
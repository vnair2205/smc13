// client/src/pages/dashboard/SubscriptionHistoryPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import InvoiceModal from '../../components/subscriptions/InvoiceModal';

// ... (All styled components remain the same)
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
`;

const SortSelect = styled.select`
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid #ccc;
`;

const DateInput = styled.input`
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid #ccc;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #444;
    }
    th {
        color: ${({ theme }) => theme.colors.textSecondary};
    }
`;

const ViewButton = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    cursor: pointer;
`;


const SubscriptionHistoryPage = () => {
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [sort, setSort] = useState('newest');
    const [date, setDate] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/subscriptions/history', {
                    headers: { 'x-auth-token': token },
                    params: { sort, date }
                });
                setSummary(res.data.currentPlan);
                setHistory(res.data.history);
            } catch (error) {
                console.error("Failed to fetch subscription history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [sort, date]);

    const handleViewInvoice = async (subscriptionId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/subscriptions/invoice/${subscriptionId}`, {
                headers: { 'x-auth-token': token }
            });
            setSelectedInvoice(res.data);
        } catch (error) {
            console.error("Failed to fetch invoice details", error);
        }
    };
    
    if (isLoading) {
        return <PageWrapper>Loading...</PageWrapper>;
    }

    // --- FIX: Logic to format the course count display ---
  const coursesDisplay = summary 
    ? `${summary.coursesRemaining} / ${summary.totalCourses}`
    : 'N/A';

    return (
        <PageWrapper>
            <Header>Subscription History</Header>

            <SummarySection>
                <SummaryCard>
                    <CardTitle>Current Plan</CardTitle>
                    <CardValue>{summary?.name || 'N/A'}</CardValue>
                </SummaryCard>
                <SummaryCard>
                    <CardTitle>Next Renewal</CardTitle>
                    <CardValue>{summary ? new Date(summary.renewalDate).toLocaleDateString() : 'N/A'}</CardValue>
                </SummaryCard>
                <SummaryCard>
        <CardTitle>Courses Left</CardTitle>
        <CardValue>{coursesDisplay}</CardValue> {/* <-- USE THE FORMATTED STRING HERE */}
    </SummaryCard>
            </SummarySection>

            <FilterSection>
                <SortSelect value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                </SortSelect>
                <DateInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
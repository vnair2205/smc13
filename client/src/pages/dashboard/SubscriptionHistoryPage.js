// client/src/pages/dashboard/SubscriptionHistoryPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../utils/api'; // Ensure this path is correct for your project
import InvoiceModal from '../../components/subscriptions/InvoiceModal';

// STYLED COMPONENTS (keep your existing styled components here)
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
    background-color: #2b2b36;
    color: white;
`;

const FilterSelect = styled.select`
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #2b2b36;
    color: white;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th, td {
        padding: 1rem;
        border-bottom: 1px solid #444;
        text-align: left;
    }
    th {
        color: ${({ theme }) => theme.colors.textSecondary};
    }
`;

const ViewButton = styled.button`
    padding: 0.5rem 1rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background-color: ${({ theme }) => theme.colors.primaryHover};
    }
`;


const SubscriptionHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [filters, setFilters] = useState({ sort: 'newest', date: '' });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/subscriptions/history?sort=${filters.sort}&date=${filters.date}`);
                setHistory(res.data.history);
                setSummary(res.data.summary);
            } catch (err) {
                console.error('Error fetching subscription history:', err);
            }
        };

        fetchHistory();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleViewInvoice = async (invoiceId) => {
        try {
            // Ensure you have an endpoint for fetching a single invoice
            const res = await api.get(`/subscriptions/invoice/${invoiceId}`);
            setSelectedInvoice(res.data);
        } catch (err) {
            console.error('Error fetching invoice details:', err);
        }
    };

    // Safely destructure currentPlan from summary state
    const { currentPlan = {} } = summary || {};

    return (
        <PageWrapper>
            <Header>Subscription History</Header>
            
            {summary && (
                <SummarySection>
                    <SummaryCard>
                        <CardTitle>Current Plan</CardTitle>
                        <CardValue>{currentPlan.name || 'N/A'}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                        <CardTitle>Status</CardTitle>
                        <CardValue style={{ color: summary.status === 'Active' ? '#4caf50' : '#f44336' }}>
                            {summary.status || 'N/A'}
                        </CardValue>
                    </SummaryCard>
                    <SummaryCard>
                        <CardTitle>AI Courses Generated</CardTitle>
                        <CardValue>
                            {summary.coursesGeneratedThisMonth ?? 0} / {currentPlan.coursesPerMonth ?? 'N/A'}
                        </CardValue>
                    </SummaryCard>
                    <SummaryCard>
                        <CardTitle>Next Renewal Date</CardTitle>
                        <CardValue>
                            {summary.nextRenewalDate ? new Date(summary.nextRenewalDate).toLocaleDateString() : 'N/A'}
                        </CardValue>
                    </SummaryCard>
                </SummarySection>
            )}

            <FilterSection>
                <FilterSelect name="sort" value={filters.sort} onChange={handleFilterChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </FilterSelect>
                <FilterInput 
                    type="month" 
                    name="date" 
                    value={filters.date} 
                    onChange={handleFilterChange} 
                />
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
                            <td>{sub.razorpay_payment_id || 'N/A'}</td>
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
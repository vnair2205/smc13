// admin-panel/src/pages/SubscriptionReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaFileCsv, FaSearch, FaEye } from 'react-icons/fa';
import { getSubscriptionReport } from '../services/reportService';
import { getSubscriptionById } from '../services/subscriptionService';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Preloader from '../components/common/Preloader';
import InvoiceModal from '../components/subscriptions/InvoiceModal';

// ... (All styled-components remain the same, no changes needed here)
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 350px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid #33333e;
  background-color: #1e1e32;
  color: white;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StyledSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #33333e;
  background-color: #1e1e32;
  color: white;
  min-width: 150px;
`;

const CSVButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  &:hover { background-color: #218838; }
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #5e72e4;
    cursor: pointer;
    font-size: 1.2rem;
`;

const ErrorMessage = styled.p`
    color: ${({ theme }) => theme.colors.danger};
    text-align: center;
    font-size: 1.2rem;
`;


const SubscriptionReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getSubscriptionReport({ page: currentPage, limit: 100, search: searchTerm, planFilter });
            setReportData(response);
        } catch (err) {
            console.error('Failed to fetch subscription report:', err);
            setError('Could not load report data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, planFilter]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchReport();
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [fetchReport]);

    const handleViewInvoice = async (subscriptionRow) => {
        try {
            const invoiceData = await getSubscriptionById(subscriptionRow._id);
            setSelectedInvoice(invoiceData);
            setSelectedUserDetails(invoiceData.user);
        } catch (error) {
            console.error("Failed to fetch invoice details:", error);
        }
    };

    // --- FIX STARTS HERE: More Robust CSV Function ---
    const downloadCSV = () => {
        if (!reportData || !reportData.subscriptions) return;

        const headers = ['Invoice #', 'First Name', 'Last Name', 'Email', 'Phone', 'Plan Name', 'Amount', 'Subscription Date', 'Next Renewal Date', 'Transaction ID'];

        // Helper function to safely format each cell
        const formatCell = (cell) => {
            const value = cell === null || cell === undefined ? '' : String(cell);
            // If the value contains a comma, quote, or newline, wrap it in double quotes
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                // Escape existing double quotes by doubling them
                const escapedValue = value.replace(/"/g, '""');
                return `"${escapedValue}"`;
            }
            return value;
        };

        const rows = reportData.subscriptions.map(sub => [
            sub.subscriptionId || '',
            sub.user?.firstName || '',
            sub.user?.lastName || '',
            sub.user?.email || '',
            sub.user?.phoneNumber || '',
            sub.plan?.name || '',
            sub.plan?.amount || 0,
            new Date(sub.startDate).toLocaleDateString(),
            new Date(sub.endDate).toLocaleDateString(),
            sub.razorpay_payment_id || ''
        ]);

        // Convert the headers and rows into a CSV string
        const headerString = headers.map(formatCell).join(',');
        const rowStrings = rows.map(row => row.map(formatCell).join(','));
        const csvString = [headerString, ...rowStrings].join('\n');

        // Create and trigger the download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'subscription_report.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    // --- FIX ENDS HERE ---

    const columns = [
        { title: 'Invoice #', key: 'subscriptionId' },
        { title: 'First Name', render: (row) => row.user?.firstName || 'N/A' },
        { title: 'Last Name', render: (row) => row.user?.lastName || 'N/A' },
        { title: 'Email', render: (row) => row.user?.email || 'N/A' },
        { title: 'Phone', render: (row) => row.user?.phoneNumber || 'N/A' },
        { title: 'Plan Name', render: (row) => row.plan?.name || 'N/A' },
        { title: 'Amount', render: (row) => `₹${row.plan?.amount || 0}` },
        { title: 'Subscription Date', render: (row) => new Date(row.startDate).toLocaleDateString() },
        { title: 'Next Renewal Date', render: (row) => new Date(row.endDate).toLocaleDateString() },
        { title: 'Transaction ID', key: 'razorpay_payment_id' },
        { title: 'Actions', render: (row) => <ActionButton onClick={() => handleViewInvoice(row)}><FaEye /></ActionButton> },
    ];

    if (loading) {
        return <Preloader />;
    }
    if (error) {
        return <PageContainer><ErrorMessage>{error}</ErrorMessage></PageContainer>;
    }
    if (!reportData) {
         return <PageContainer><ErrorMessage>No report data available.</ErrorMessage></PageContainer>;
    }

    return (
        <PageContainer>
            {/* ... (The rest of your component's JSX remains the same) */}
            <Title>Subscription Report</Title>
            <StatsContainer>
                <StatCard title="Active Subscriptions" value={reportData.stats.active} type="active" />
                <StatCard title="Inactive Subscriptions" value={reportData.stats.inactive} type="inactive" />
                {reportData.stats.plans.map(plan => (
                    <StatCard key={plan.name} title={plan.name} value={plan.count} type="total" />
                ))}
            </StatsContainer>
            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput
                        type="text"
                        placeholder="Search by email or transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>
                <FilterContainer>
                    <StyledSelect value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                        <option value="">All Plans</option>
                        {reportData.stats.allPlans.map(plan => (
                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                        ))}
                    </StyledSelect>
                    <CSVButton onClick={downloadCSV}><FaFileCsv /> Download CSV</CSVButton>
                </FilterContainer>
            </ControlsContainer>
            <DataTable columns={columns} data={reportData.subscriptions} />
            <Pagination
                currentPage={currentPage}
                totalPages={reportData.totalPages}
                onPageChange={setCurrentPage}
            />
            {selectedInvoice && selectedUserDetails && (
                <InvoiceModal
                    isOpen={!!selectedInvoice}
                    invoiceDetails={selectedInvoice}
                    userDetails={selectedUserDetails}
                    onClose={() => {
                        setSelectedInvoice(null);
                        setSelectedUserDetails(null);
                    }}
                />
            )}
        </PageContainer>
    );
};

export default SubscriptionReportPage;
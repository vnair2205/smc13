// admin-panel/src/pages/DroppedCustomersReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaFileCsv, FaSearch } from 'react-icons/fa';
import { getDroppedCustomersReport } from '../services/reportService';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Preloader from '../components/common/Preloader';

// --- Add the same styled-components from your other report pages ---
const PageContainer = styled.div` padding: 2rem; `;
const Title = styled.h1` font-size: 2rem; margin-bottom: 2rem; `;
const StatsContainer = styled.div` display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; `;
const ControlsContainer = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; `;
const SearchContainer = styled.div` position: relative; width: 350px; `;
const SearchInput = styled.input` width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 8px; border: 1px solid #33333e; background-color: #1e1e32; color: white; `;
const SearchIcon = styled(FaSearch)` position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6c757d; `;
const CSVButton = styled.button` display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; background-color: #28a745; color: white; cursor: pointer; &:hover { background-color: #218838; } `;

const DroppedCustomersReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getDroppedCustomersReport({ page: currentPage, limit: 100, search: searchTerm });
            setReportData(response);
        } catch (error) {
            console.error('Failed to fetch dropped customers report:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => fetchReport(), 500);
        return () => clearTimeout(debounceTimer);
    }, [fetchReport]);

    const downloadCSV = () => {
        if (!reportData) return;
        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Plan Selected', 'Signup Date'];
        const rows = reportData.droppedCustomers.map(user => [
            user.firstName,
            user.lastName,
            user.email,
            user.phoneNumber || 'N/A',
            user.selectedPlan?.name || 'N/A',
            new Date(user.createdAt).toLocaleDateString()
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "dropped_customers_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { title: 'First Name', key: 'firstName' },
        { title: 'Last Name', key: 'lastName' },
        { title: 'Email', key: 'email' },
        { title: 'Phone', key: 'phoneNumber' },
        { title: 'Plan Selected', render: (row) => row.selectedPlan?.name || 'N/A' },
        { title: 'Signup Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    ];

    if (loading || !reportData) return <Preloader />;

    return (
        <PageContainer>
            <Title>Dropped Customers Report</Title>
            <StatsContainer>
                <StatCard title="Total Dropped Customers" value={reportData.stats.totalDropped} type="inactive" />
            </StatsContainer>
            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput type="text" placeholder="Search by user email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </SearchContainer>
                <CSVButton onClick={downloadCSV}><FaFileCsv /> Download CSV</CSVButton>
            </ControlsContainer>
            <DataTable columns={columns} data={reportData.droppedCustomers} />
            <Pagination currentPage={currentPage} totalPages={reportData.totalPages} onPageChange={setCurrentPage} />
        </PageContainer>
    );
};

export default DroppedCustomersReportPage;
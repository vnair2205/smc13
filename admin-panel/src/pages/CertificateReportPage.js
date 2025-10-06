// admin-panel/src/pages/CertificateReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEye, FaFileCsv, FaSearch } from 'react-icons/fa';
import { getCertificateReport } from '../services/reportService';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import Preloader from '../components/common/Preloader';
import Pagination from '../components/common/Pagination'; // 1. Import Pagination

// --- Styled Components ---
const PageContainer = styled.div` padding: 2rem; `;
const Title = styled.h1` font-size: 2rem; margin-bottom: 2rem; `;
const StatsContainer = styled.div` display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; `;
const ActionButton = styled.button` background: none; border: none; color: #5e72e4; cursor: pointer; font-size: 1.2rem; `;
const ControlsContainer = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; `;
const SearchContainer = styled.div` position: relative; width: 350px; `;
const SearchInput = styled.input` width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 8px; border: 1px solid #33333e; background-color: #1e1e32; color: white; `;
const SearchIcon = styled(FaSearch)` position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6c757d; `;
const CSVButton = styled.button` display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; background-color: #28a745; color: white; cursor: pointer; &:hover { background-color: #218838; } `;

const CertificateReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // 2. Add currentPage state
    const navigate = useNavigate();

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            // 3. Pass currentPage to the service call
            const response = await getCertificateReport({ search: searchTerm, page: currentPage, limit: 100 });
            setReportData(response);
        } catch (error) {
            console.error('Failed to fetch certificate report:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage]); // 4. Add currentPage to dependency array

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchReport();
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [fetchReport]);

    const downloadCSV = () => {
        // ... (downloadCSV function remains the same)
    };

    const columns = [
        { title: 'First Name', render: (row) => row.user?.firstName || 'N/A' },
        { title: 'Last Name', render: (row) => row.user?.lastName || 'N/A' },
        { title: 'Email', render: (row) => row.user?.email || 'N/A' },
        { title: 'Phone', render: (row) => row.user?.phoneNumber || 'N/A' },
        { title: 'Language', key: 'languageName' },
        { title: 'Course Topic', key: 'topic' },
        { title: 'Subtopics', key: 'numSubtopics' },
        { title: 'Course Type', key: 'courseType' },
        { title: 'Actions', render: (row) => <ActionButton onClick={() => navigate(`/admin/certificate/${row._id}`)}><FaEye /></ActionButton> },
    ];

    if (loading || !reportData) return <Preloader />;

    return (
        <PageContainer>
            <Title>Certificates Report</Title>
            <StatsContainer>
                <StatCard title="Total Certificates Issued" value={reportData.stats.totalCertificates} type="total" />
            </StatsContainer>

            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput
                        type="text"
                        placeholder="Search by user email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>
                <CSVButton onClick={downloadCSV}><FaFileCsv /> Download CSV</CSVButton>
            </ControlsContainer>

            <DataTable columns={columns} data={reportData.certificates} />

            {/* 5. Add the Pagination component */}
            <Pagination
                currentPage={reportData.currentPage}
                totalPages={reportData.totalPages}
                onPageChange={setCurrentPage}
            />
        </PageContainer>
    );
};

export default CertificateReportPage;
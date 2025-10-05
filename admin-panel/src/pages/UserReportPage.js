import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaUsers, FaUserCheck, FaUserSlash, FaDownload } from 'react-icons/fa';
import { getUserReport } from '../services/reportService';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Preloader from '../components/common/Preloader';

// --- Styled Components (No changes needed here) ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: #1e1e2d;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ color }) => color};
`;

const StatInfo = styled.div`
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: #a7a7a7;
  }
  p {
    margin: 0.25rem 0 0;
    font-size: 2rem;
    font-weight: 700;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
`;

const DownloadButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const UserReportPage = () => {
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 100;

    const fetchReportData = useCallback(async (page) => {
        setLoading(true);
        try {
            const { data } = await getUserReport(page, itemsPerPage);
            setStats(data.stats || { total: 0, active: 0, inactive: 0 });
            setUsers(data.users || []); 
            setTotalPages(data.totalPages || 0);
            setCurrentPage(data.currentPage || 1);
        } catch (error) {
            console.error('Failed to fetch user report:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReportData(currentPage);
    }, [currentPage, fetchReportData]);

    const downloadCSV = () => {
        const safeUsers = users || [];
        const headers = ["Sr No", "First Name", "Last Name", "Email Id", "Phone Number", "Current Plan", "Current Plan Amount", "Next Renewal Date", "Signup Date", "Location", "Generated Courses", "Pre-Generated Courses"];
        const rows = safeUsers.map((user, index) => [
            (currentPage - 1) * itemsPerPage + index + 1,
            user.firstName || '',
            user.lastName || '',
            user.email || '',
            user.phoneNumber || 'N/A',
            user.currentPlan || 'N/A',
            user.currentPlanAmount || 0,
            user.nextRenewalDate ? new Date(user.nextRenewalDate).toLocaleDateString() : 'N/A',
            user.signupDate ? new Date(user.signupDate).toLocaleDateString() : 'N/A',
            user.location || 'N/A',
            user.generatedCoursesCount || 0,
            user.preGeneratedCoursesCount || 0
        ].map(field => `"${String(field).replace(/"/g, '""')}"`));

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- THIS IS THE CORRECTED CODE ---
    // It now perfectly matches the structure your specific DataTable component needs.
    const columns = [
        { title: 'Sr No', key: 'srNo', render: (row, index) => (currentPage - 1) * itemsPerPage + index + 1 },
        { title: 'First Name', key: 'firstName' },
        { title: 'Last Name', key: 'lastName' },
        { title: 'Email Id', key: 'email' },
        { title: 'Phone Number', key: 'phoneNumber', render: (row) => row.phoneNumber || 'N/A' },
        { title: 'Current Plan', key: 'currentPlan', render: (row) => row.currentPlan || 'N/A' },
        { title: 'Plan Amount', key: 'currentPlanAmount', render: (row) => row.currentPlanAmount || 0 },
        { title: 'Next Renewal', key: 'nextRenewalDate', render: (row) => row.nextRenewalDate ? new Date(row.nextRenewalDate).toLocaleDateString() : 'N/A' },
        { title: 'Signup Date', key: 'signupDate', render: (row) => row.signupDate ? new Date(row.signupDate).toLocaleDateString() : 'N/A' },
        { title: 'Location', key: 'location', render: (row) => row.location || 'N/A' },
        { title: 'Generated', key: 'generatedCoursesCount' },
        { title: 'Pre-Generated', key: 'preGeneratedCoursesCount' },
    ];
    // ------------------------------------

    if (loading) return <Preloader />;

    return (
        <PageContainer>
            <PageTitle>User Report</PageTitle>
            <StatsContainer>
                 <StatCard>
                    <StatIcon color="#3498db"><FaUsers /></StatIcon>
                    <StatInfo>
                        <h3>Total Users</h3>
                        <p>{stats.total}</p>
                    </StatInfo>
                </StatCard>
                <StatCard>
                    <StatIcon color="#2ecc71"><FaUserCheck /></StatIcon>
                    <StatInfo>
                        <h3>Active Users</h3>
                        <p>{stats.active}</p>
                    </StatInfo>
                </StatCard>
                <StatCard>
                    <StatIcon color="#e74c3c"><FaUserSlash /></StatIcon>
                    <StatInfo>
                        <h3>Inactive Users</h3>
                        <p>{stats.inactive}</p>
                    </StatInfo>
                </StatCard>
            </StatsContainer>
            <ControlsContainer>
                <DownloadButton onClick={downloadCSV}>
                    <FaDownload />
                    Download to CSV
                </DownloadButton>
            </ControlsContainer>
            <DataTable columns={columns} data={users || []} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </PageContainer>
    );
};

export default UserReportPage;
// admin-panel/src/pages/UserReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaFileCsv } from 'react-icons/fa';

import { getUserReport } from '../services/reportService';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Preloader from '../components/common/Preloader';

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
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 2rem;
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
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

const UserReportPage = () => {
    const [reportData, setReportData] = useState({
        stats: { total: 0, active: 0, inactive: 0 },
        users: [],
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 100;

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUserReport(currentPage, itemsPerPage);
            if (response) {
                setReportData({
                    stats: response.stats,
                    users: response.users,
                });
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch user report:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const downloadCSV = () => {
        const headers = [
            'Sr No', 'First Name', 'Last Name', 'Email Id', 'Phone Number',
            'Current Plan', 'Current Plan Amount', 'Next Renewal Date',
            'Signup Date', 'Location', 'No Of Courses Generated', 'Pre Generated Courses'
        ];

        const rows = reportData.users.map((user, index) => [
            (currentPage - 1) * itemsPerPage + index + 1,
            user.firstName,
            user.lastName,
            user.email,
            user.phoneNumber || 'N/A',
            user.currentPlan || 'N/A',
            user.currentPlanAmount || 0,
            user.nextRenewalDate ? new Date(user.nextRenewalDate).toLocaleDateString() : 'N/A',
            new Date(user.signupDate).toLocaleDateString(),
            user.location || 'N/A',
            user.generatedCoursesCount,
            user.preGeneratedCoursesCount
        ]);

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

    const columns = [
        { title: 'Sr No', render: (row, index) => (currentPage - 1) * itemsPerPage + index + 1 },
        { title: 'First Name', key: 'firstName' },
        { title: 'Last Name', key: 'lastName' },
        { title: 'Email Id', key: 'email' },
        { title: 'Phone Number', render: (row) => row.phoneNumber || 'N/A' },
        { title: 'Current Plan', render: (row) => row.currentPlan || 'N/A' },
        { title: 'Current Plan Amount', render: (row) => row.currentPlanAmount || 0 },
        { title: 'Next Renewal Date', render: (row) => row.nextRenewalDate ? new Date(row.nextRenewalDate).toLocaleDateString() : 'N/A' },
        { title: 'Signup Date', render: (row) => new Date(row.signupDate).toLocaleDateString() },
        { title: 'Location', render: (row) => row.location || 'N/A' },
        { title: 'No Of Courses Generated', key: 'generatedCoursesCount' },
        { title: 'Pre Generated Courses', key: 'preGeneratedCoursesCount' },
    ];

    if (loading) {
        return <Preloader />;
    }

    return (
        <PageContainer>
            <Title>User Reports</Title>

            <StatsContainer>
                <StatCard title="Total Users" value={reportData.stats.total} type="total" />
                <StatCard title="Active Users" value={reportData.stats.active} type="active" />
                <StatCard title="Inactive Users" value={reportData.stats.inactive} type="inactive" />
            </StatsContainer>

            <ControlsContainer>
                <CSVButton onClick={downloadCSV}>
                    <FaFileCsv /> Download to CSV
                </CSVButton>
            </ControlsContainer>

            <DataTable columns={columns} data={reportData.users} />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </PageContainer>
    );
};

export default UserReportPage;

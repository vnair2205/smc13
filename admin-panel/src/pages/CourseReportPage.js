// admin-panel/src/pages/CourseReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaFileCsv, FaSearch, FaEye } from 'react-icons/fa';
import { getCourseReport } from '../services/reportService';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Preloader from '../components/common/Preloader';
import { languages } from '../constants/languages';

// --- Add the same styled-components from your other report pages ---
const PageContainer = styled.div` padding: 2rem; `;
const Title = styled.h1` font-size: 2rem; margin-bottom: 2rem; `;
const StatsContainer = styled.div` display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; `;
const ControlsContainer = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; `;
const SearchContainer = styled.div` position: relative; width: 350px; `;
const SearchInput = styled.input` width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 8px; border: 1px solid #33333e; background-color: #1e1e32; color: white; `;
const SearchIcon = styled(FaSearch)` position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6c757d; `;
const FilterContainer = styled.div` display: flex; align-items: center; gap: 1rem; `;
const StyledSelect = styled.select` padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #33333e; background-color: #1e1e32; color: white; min-width: 150px; `;
const CSVButton = styled.button` display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; background-color: #28a745; color: white; cursor: pointer; &:hover { background-color: #218838; } `;
const ActionButton = styled.button` background: none; border: none; color: #5e72e4; cursor: pointer; font-size: 1.2rem; `;

const CourseReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [languageFilter, setLanguageFilter] = useState('');
    const navigate = useNavigate();

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCourseReport({ page: currentPage, limit: 100, search: searchTerm, status: statusFilter, language: languageFilter });
            setReportData(response);
        } catch (error) {
            console.error('Failed to fetch course report:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter, languageFilter]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => fetchReport(), 500);
        return () => clearTimeout(debounceTimer);
    }, [fetchReport]);

    const downloadCSV = () => {
        if (!reportData) return;
        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Course Language', 'Course Topic', 'No Of Subtopics', 'Status'];
        const rows = reportData.courses.map(course => [
            course.user?.firstName || 'N/A',
            course.user?.lastName || 'N/A',
            course.user?.email || 'N/A',
            course.user?.phoneNumber || 'N/A',
            course.languageName || 'N/A',
            `"${course.topic.replace(/"/g, '""')}"`,
            course.numSubtopics || 0,
            course.status || 'N/A'
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "courses_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { title: 'First Name', render: (row) => row.user?.firstName || 'N/A' },
        { title: 'Last Name', render: (row) => row.user?.lastName || 'N/A' },
        { title: 'Email', render: (row) => row.user?.email || 'N/A' },
        { title: 'Phone', render: (row) => row.user?.phoneNumber || 'N/A' },
        { title: 'Language', key: 'languageName' },
        { title: 'Course Topic', key: 'topic' },
        { title: 'Subtopics', key: 'numSubtopics' },
        { title: 'Status', key: 'status' },
        { title: 'Actions', render: (row) => <ActionButton onClick={() => navigate(`/admin/view-course/${row._id}`)}><FaEye /></ActionButton> },
    ];

    if (loading || !reportData) return <Preloader />;

    return (
        <PageContainer>
            <Title>User-Generated Courses Report</Title>
            <StatsContainer>
                <StatCard title="Total Courses Generated" value={reportData.stats.totalCourses} type="total" />
            </StatsContainer>
            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput type="text" placeholder="Search by user email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </SearchContainer>
                <FilterContainer>
                    <StyledSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </StyledSelect>
                    <StyledSelect value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                        <option value="">All Languages</option>
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </StyledSelect>
                    <CSVButton onClick={downloadCSV}><FaFileCsv /> Download CSV</CSVButton>
                </FilterContainer>
            </ControlsContainer>
            <DataTable columns={columns} data={reportData.courses} />
            <Pagination currentPage={currentPage} totalPages={reportData.totalPages} onPageChange={setCurrentPage} />
        </PageContainer>
    );
};

export default CourseReportPage;
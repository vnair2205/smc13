// admin-panel/src/pages/PregeneratedCoursesReportPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaFileCsv, FaSearch, FaEye } from 'react-icons/fa';
import { getPregeneratedCourseReport } from '../services/reportService';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import Preloader from '../components/common/Preloader';

// ... (Add the same styled-components from SubscriptionReportPage.js: PageContainer, Title, StatsContainer, etc.)
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


const PregeneratedCoursesReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPregeneratedCourseReport({ search: searchTerm, category: categoryFilter });
            setReportData(response);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, categoryFilter]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => fetchReport(), 500);
        return () => clearTimeout(debounceTimer);
    }, [fetchReport]);

    const downloadCSV = () => {
        if (!reportData) return;
        const headers = ['Category', 'Sub Category 1', 'Sub Category 2', 'Course Topic', 'Accessed Count'];
        const rows = reportData.courses.map(c => [
            c.category?.name || 'N/A',
            c.subCategory1?.name || 'N/A',
            c.subCategory2?.name || 'N/A',
            `"${c.topic.replace(/"/g, '""')}"`,
            c.accessedCount
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "pregenerated_courses_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const columns = [
        { title: 'Category', render: (row) => row.category?.name || 'N/A' },
        { title: 'Sub Category 1', render: (row) => row.subCategory1?.name || 'N/A' },
        { title: 'Sub Category 2', render: (row) => row.subCategory2?.name || 'N/A' },
        { title: 'Course Topic', key: 'topic' },
        { title: 'Accessed Count', key: 'accessedCount' },
        { title: 'Actions', render: (row) => <ActionButton onClick={() => navigate(`/reports/pregenerated/${row._id}`)}><FaEye /></ActionButton> },
    ];

    if (loading || !reportData) return <Preloader />;

    return (
        <PageContainer>
            <Title>Pre-generated Courses Report</Title>
            <StatsContainer>
                <StatCard title="Total Categories" value={reportData.stats.categoryCount} type="total" />
                <StatCard title="Total Sub Categories 1" value={reportData.stats.subCategory1Count} type="total" />
                <StatCard title="Total Sub Categories 2" value={reportData.stats.subCategory2Count} type="total" />
                <StatCard title="Total Courses" value={reportData.stats.totalCourses} type="total" />
            </StatsContainer>
            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput type="text" placeholder="Search by course name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </SearchContainer>
                <FilterContainer>
                    <StyledSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        {reportData.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </StyledSelect>
                    <CSVButton onClick={downloadCSV}><FaFileCsv /> Download CSV</CSVButton>
                </FilterContainer>
            </ControlsContainer>
            <DataTable columns={columns} data={reportData.courses} />
        </PageContainer>
    );
};

export default PregeneratedCoursesReportPage;
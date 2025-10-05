// admin-panel/src/pages/PregeneratedCourseAccessDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFileCsv, FaArrowLeft } from 'react-icons/fa';
import { getPregeneratedCourseAccessDetails } from '../services/reportService';
import DataTable from '../components/common/DataTable';
import Preloader from '../components/common/Preloader';

// ... (Add the same styled-components from the main report page)
const PageContainer = styled.div` padding: 2rem; `;
const Title = styled.h2` font-size: 1.5rem; margin-bottom: 0.5rem; `;
const Subtitle = styled.p` margin-bottom: 2rem; color: #aaa; `;
const ControlsContainer = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; `;
const CSVButton = styled.button` display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; background-color: #28a745; color: white; cursor: pointer; &:hover { background-color: #218838; } `;
const BackLink = styled(Link)` color: #5e72e4; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; `;

const PregeneratedCourseAccessDetailsPage = () => {
    const { id } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await getPregeneratedCourseAccessDetails(id);
                setDetails(response);
            } catch (error) {
                console.error('Failed to fetch details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const downloadCSV = () => {
        if (!details) return;
        const headers = ['First Name', 'Last Name', 'Email', 'Phone Number'];
        const rows = details.users.map(u => [u.firstName, u.lastName, u.email, u.phoneNumber || 'N/A']);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `access_details_${details.course.topic}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { title: 'First Name', key: 'firstName' },
        { title: 'Last Name', key: 'lastName' },
        { title: 'Email', key: 'email' },
        { title: 'Phone Number', key: 'phoneNumber' },
    ];

    if (loading || !details) return <Preloader />;

    return (
        <PageContainer>
            <ControlsContainer>
                <BackLink to="/reports/pregenerated"><FaArrowLeft /> Back to Report</BackLink>
                <CSVButton onClick={downloadCSV}><FaFileCsv /> Download User List</CSVButton>
            </ControlsContainer>
            <Title>{details.course.topic}</Title>
            <Subtitle>
                {details.course.category?.name} &gt; {details.course.subCategory1?.name} &gt; {details.course.subCategory2?.name}
            </Subtitle>
            <DataTable columns={columns} data={details.users} />
        </PageContainer>
    );
};

export default PregeneratedCourseAccessDetailsPage;
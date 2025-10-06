// admin-panel/src/pages/AdminCertificatePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas'; 
import { jsPDF } from 'jspdf';
import Preloader from '../components/common/Preloader';
import certificateBg from '../assets/SMC-Certificate.jpg'; // Ensure this path is correct
import { FiDownload, FiX, FiHome } from 'react-icons/fi';

// --- Styled Components (Copied directly from the client-side for identical look) ---

const PageContainer = styled.div`
    padding: 2rem;
    background-color: #12121c; /* Admin panel has a dark theme */
    color: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative; 
    overflow-y: auto; 
`;

const CertificateWrapper = styled.div`
    width: 595px;
    height: 842px;
    position: relative;
    background-image: url(${certificateBg});
    background-size: 100% 100%;
    font-family: 'Calisto MT', serif; 
    color: #1e1e2d;
    flex-shrink: 0; /* Prevents the certificate from shrinking */
`;

const UserName = styled.h1`
    position: absolute;
    top: 504px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 32px;
    font-weight: bold;
    margin: 0;
`;

const CourseName = styled.p`
    position: absolute;
    top: 582px;
    left: 0;
    width: 100%;
    padding: 0 60px;
    box-sizing: border-box;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    line-height: 1.4;
    margin: 0;
`;

const CompletionDate = styled.p`
    position: absolute;
    bottom: 50px;
    left: 22px; 
    width: 150px;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
`;

const QrCodeContainer = styled.div`
    position: absolute;
    bottom: 50px;
    left: 49%;
    transform: translateX(-50%);
    background-color: white;
    padding: 5px;
    border: 1px solid #ccc;
`;

const BottomActionsContainer = styled.div`
    margin-top: 2rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 650px;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold; 
    cursor: pointer;
    white-space: nowrap; 
    background-color: ${({ primary }) => (primary ? '#00bfa6' : '#555')};
    color: white;
    transition: background-color 0.2s ease;
    &:hover {
        background-color: ${({ primary }) => (primary ? '#03a092' : '#777')}; 
    }
`;


// --- Component Logic (Adapted for Admin Panel) ---

const AdminCertificatePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef();

    // The verification URL should point to the main client application, not the admin panel
    const verificationUrl = `https://app.seekmycourse.com/verify/${courseId}/${user?._id}`;

    useEffect(() => {
        const fetchCertificateData = async () => {
            const token = localStorage.getItem('adminToken'); // Use admin token
            const config = { headers: { 'x-auth-token': token } };
            try {
                // Use the admin endpoint to get course details, which includes user info
                const res = await axios.get(`/api/admin/course-details/${courseId}`, config);
                setCourse(res.data);
                setUser(res.data.user); // The user is nested in the course object
            } catch (error) {
                console.error("Failed to fetch certificate data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificateData();
    }, [courseId]);

    const formatName = (firstName, lastName) => {
        const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '');
        return `${capitalize(firstName)} ${capitalize(lastName)}`;
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDownload = () => {
        if (!certificateRef.current) return;
        html2canvas(certificateRef.current, { scale: 4, useCORS: true, backgroundColor: null })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                const sanitizedTopic = (course.englishTopic || course.topic).replace(/[^a-zA-Z0-9]/g, '_');
                pdf.save(`SeekMYCOURSE-Certificate-${sanitizedTopic}.pdf`);
            });
    };
    
    // Since this page opens in a new tab for the admin, a simple close function is best
    const handleClose = () => {
        window.close();
    };

    if (loading) return <Preloader />;
    if (!course || !user) return <PageContainer><h2>Certificate data not found.</h2></PageContainer>;

    return (
        <PageContainer>
            <CertificateWrapper ref={certificateRef}>
                <UserName>{formatName(user.firstName, user.lastName)}</UserName>
                <CourseName>{(course.englishTopic || course.topic).toUpperCase()}</CourseName>
                <CompletionDate>{formatDate(course.completedAt || new Date())}</CompletionDate>
                <QrCodeContainer>
                    <QRCodeSVG value={verificationUrl} size={80} bgColor="#ffffff" fgColor="#000000" level="L" />
                </QrCodeContainer>
            </CertificateWrapper>

            <BottomActionsContainer>
                <ActionButton primary onClick={handleDownload}>
                    <FiDownload /> Download Certificate
                </ActionButton>
                <ActionButton onClick={handleClose}>
                    <FiX /> Close Tab
                </ActionButton>
            </BottomActionsContainer>
        </PageContainer>
    );
};

export default AdminCertificatePage;
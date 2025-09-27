// client/src/pages/dashboard/CertificatePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas'; 
import { jsPDF } from 'jspdf';
import Preloader from '../../components/common/Preloader';
import certificateBg from '../../assets/SMC-Certificate.jpg';
import { FiDownload, FiX, FiHome } from 'react-icons/fi'; // 1. Import the FiHome icon
import { useTranslation } from 'react-i18next'; // 2. Import the translation hook

const PageContainer = styled.div`
    padding: 2rem;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative; 
    overflow-y: auto;

    /* --- FIX 1: Adjust padding for mobile --- */
    @media (max-width: 600px) {
        padding: 1rem;
    }
`;

const CertificateWrapper = styled.div`
    width: 100%; /* Take full width of its container */
    max-width: 595px; /* But don't exceed the original width */
    position: relative;
    background-image: url(${certificateBg});
    background-size: contain; /* Use contain to ensure the whole image fits */
    background-repeat: no-repeat;
    font-family: 'Calisto MT', serif; 
    color: #1e1e2d;

    /* Maintain A4 aspect ratio (height / width) */
    padding-bottom: 141.5%; /* 842 / 595 = 1.415 */
`;

// Each element is positioned precisely
const UserName = styled.h1`
    position: absolute;
    top: 60%; /* Adjusted from 504px */
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 4vw; /* Responsive font size */
    font-weight: bold;
    margin: 0;
    @media (min-width: 595px) { font-size: 32px; } /* Max font size */
`;
const CourseName = styled.p`
    position: absolute;
    top: 69%; /* Adjusted from 582px */
    left: 10%;
    width: 80%;
    text-align: center;
    font-size: 2.5vw; /* Responsive font size */
    font-weight: bold;
    line-height: 1.4;
    margin: 0;
    @media (min-width: 595px) { font-size: 18px; } /* Max font size */
`;

const CompletionDate = styled.p`
    position: absolute;
    bottom: 6%; /* Adjusted from 50px */
    left: 3.5%;
    width: 25%;
    text-align: center;
    font-size: 2vw; /* Responsive font size */
    font-weight: bold;
    @media (min-width: 595px) { font-size: 14px; } /* Max font size */
`;

const QrCodeContainer = styled.div`
    position: absolute;
    bottom: 6%; /* Adjusted from 50px */
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 5px;
    border: 1px solid #ccc;
    
    /* Responsive QR Code */
    & svg {
        width: 12vw;
        height: 12vw;
        max-width: 80px;
        max-height: 80px;
    }
`;

const BottomActionsContainer = styled.div`
    margin-top: 2rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 650px;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch; /* Make buttons full-width */
    }
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
    background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#555')};
    color: ${({ theme, primary }) => (primary ? theme.colors.background : 'white')};
    transition: background-color 0.2s ease;

    &:hover {
        background-color: ${({ theme, primary }) => (primary ? '#03a092' : '#777')}; 
    }
`;


const CertificatePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation(); // 3. Initialize the hook
    const [course, setCourse] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef();

    const verificationUrl = `${window.location.origin}/verify/${courseId}/${user?.id}`;

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            try {
                const courseRes = await axios.get(`/api/course/${courseId}`, config);
                const userRes = await axios.get('/api/dashboard', config);
                
                setCourse(courseRes.data);
                setUser(userRes.data.user);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                navigate('/dashboard'); 
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, navigate]);

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
        html2canvas(certificateRef.current, {
            scale: 6, 
            useCORS: true,
            backgroundColor: null
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px', 
                format: 'a4' 
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); 
            const sanitizedTopic = (course.englishTopic || course.topic).replace(/[^a-zA-Z0-9]/g, '_');
            pdf.save(`SeekMYCOURSE-Certificate-${sanitizedTopic}.pdf`);
        });
    };

    // 4. Function to handle navigation
    const handleBackToHome = () => {
        navigate('/dashboard');
    };

    if (loading) return <Preloader />;

    return (
        <PageContainer>
            <CertificateWrapper ref={certificateRef}>
                <UserName>{user ? formatName(user.firstName, user.lastName) : 'Your Name'}</UserName>
                <CourseName>{course ? (course.englishTopic || course.topic).toUpperCase() : 'YOUR COURSE TOPIC'}</CourseName>
                <CompletionDate>{formatDate(new Date())}</CompletionDate>
                <QrCodeContainer>
                    <QRCodeSVG
                        value={verificationUrl}
                        size={80}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="L"
                    />
                </QrCodeContainer>
            </CertificateWrapper>

            <BottomActionsContainer>
                <ActionButton primary onClick={handleDownload}>
                    <FiDownload /> {t('course_generation.export_course_to_pdf', { defaultValue: 'Download Certificate' })}
                </ActionButton>
                {/* --- 5. THE NEW BUTTON --- */}
                <ActionButton onClick={handleBackToHome}>
                    <FiHome /> {t('course_generation.back_to_home_button_text', { defaultValue: 'Back to Home' })}
                </ActionButton>
                <ActionButton onClick={() => navigate(`/course/${courseId}`)}>
                    <FiX /> Close
                </ActionButton>
            </BottomActionsContainer>
        </PageContainer>
    );
};

export default CertificatePage;
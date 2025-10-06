import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Preloader from '../../components/common/Preloader';
import certificateBg from '../../assets/SMC-Certificate.jpg';
import { FiDownload, FiX, FiHome } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

// --- (All styled-components remain the same) ---
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
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: flex-start;
  }
`;

const CertificateWrapper = styled.div`
  width: 595px;
  height: 842px;
  position: relative;
  background-image: url(${certificateBg});
  background-size: 100% 100%;
  font-family: 'Calisto MT', serif;
  color: #1e1e2d;

  @media (max-width: 768px) {
    width: 95vw;
    height: calc(95vw * 1.414);
  }
`;

const UserName = styled.h1`
  position: absolute;
  top: 59.8%;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 4.5vw;
  }
`;

const CourseName = styled.p`
  position: absolute;
  top: 69.1%;
  left: 0;
  width: 100%;
  padding: 0 10%;
  box-sizing: border-box;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.4;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.5vw;
    line-height: 1.5;
  }
`;

const CompletionDate = styled.p`
  position: absolute;
  bottom: 5.9%;
  left: 3.7%;
  width: 25.2%;
  text-align: center;
  font-size: 14px;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2vw;
  }
`;

const QrCodeContainer = styled.div`
  position: absolute;
  bottom: 5.9%;
  left: 49%;
  transform: translateX(-50%);
  background-color: white;
  padding: 5px;
  border: 1px solid #ccc;

  @media (max-width: 768px) {
    padding: 0.8vw;
    
    & > svg {
        width: 12vw;
        height: 12vw;
    }
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

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    max-width: 90%;
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

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CertificatePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
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

    /* --- START: SIMPLIFIED A4 DOWNLOAD FIX --- */
    const handleDownload = () => {
        const certificateNode = certificateRef.current;
        if (!certificateNode) return;

        html2canvas(certificateNode, {
            scale: 3, // Use a high scale for a crisp capture
            useCORS: true,
            backgroundColor: null
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95); // Capture as high-quality JPEG

            // 1. Create a standard A4 PDF in portrait orientation
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // 2. Get the dimensions of the A4 page
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // 3. Add the captured image to the PDF, letting it fit the A4 page
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            const sanitizedTopic = (course.englishTopic || course.topic).replace(/[^a-zA-Z0-9]/g, '_');
            pdf.save(`SeekMYCOURSE-Certificate-${sanitizedTopic}.pdf`);
        });
    };
    /* --- END: SIMPLIFIED A4 DOWNLOAD FIX --- */

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
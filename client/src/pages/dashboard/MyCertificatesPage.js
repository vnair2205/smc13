import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Preloader from '../../components/common/Preloader';
import CertificateThumbnail from '../../components/common/CertificateThumbnail';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
`;

// --- NEW: Search Input ---
const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  margin-bottom: 2rem;
  background-color: #1e1e2d;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: box-shadow 0.2s;

  &:focus {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`;

const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  flex-grow: 1;
`;

const CertificateCard = styled.div`
  background-color: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const CardThumbnail = styled.div`
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const CardContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.75rem;
`;

const CardDetail = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.4rem;
  span {
    font-weight: bold;
    color: white;
  }
`;

const CardButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const NoCertificatesMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 3rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MyCertificatesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- NEW: State for search term ---
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NEW: State for debounced search term to avoid excessive API calls ---
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // --- NEW: Debounce effect ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  
  const fetchCertificates = useCallback(async (searchQuery = '') => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }
    const config = { headers: { 'x-auth-token': token } };

    try {
        setLoading(true);
        const certResponse = await axios.get('/api/course/', {
            ...config,
            params: {
                certified: true,
                limit: 100,
                search: searchQuery, // Pass search term to API
            },
        });
        setCertificates(certResponse.data.docs);
    } catch (certError) {
        console.error("Failed to fetch certificates:", certError);
        setError(t('errors.certificates_fetch_failed', 'Could not load your certificates at this time.'));
    } finally {
        setLoading(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    const fetchInitialData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const config = { headers: { 'x-auth-token': token } };
            const userResponse = await axios.get('/api/dashboard', config);
            setUser(userResponse.data.user);
        } catch (err) {
            console.error("Failed to fetch user data:", err);
            setError(t('errors.generic', 'An unexpected error occurred.'));
            setLoading(false);
        }
    };
    fetchInitialData();
  }, [navigate, t]);

  useEffect(() => {
    if (user) { // Only fetch certificates once user data is available
        fetchCertificates(debouncedSearchTerm);
    }
  }, [user, debouncedSearchTerm, fetchCertificates]);

  if (!user && loading) {
    return <Preloader />;
  }

  return (
    <PageContainer>
      <HeaderTitle>{t('my_certificates_page.title', { defaultValue: 'My Certificates' })}</HeaderTitle>
      
      {/* --- NEW: Search Bar --- */}
      <SearchInput
        type="text"
        placeholder={t('my_certificates_page.search_placeholder', 'Search by course name...')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {loading ? <Preloader /> : (
        <>
          {error && <NoCertificatesMessage style={{color: 'red'}}>{error}</NoCertificatesMessage>}
          {certificates.length === 0 && !error ? (
            <NoCertificatesMessage>{t('my_certificates_page.no_certificates')}</NoCertificatesMessage>
          ) : (
            <CertificateGrid>
              {certificates.map((course) => (
                <CertificateCard key={course._id}>
                  <CardThumbnail>
                    <CertificateThumbnail course={course} user={user} />
                  </CardThumbnail>
                  <CardContent>
                    <CardTitle title={course.englishTopic || course.topic}>{course.englishTopic || course.topic}</CardTitle>
                    <CardDetail>{t('sidebar.created_on')}: <span>{format(new Date(course.createdAt), 'dd/MM/yyyy')}</span></CardDetail>
                    <CardDetail>{t('sidebar.course_completion_date')}: <span>{format(new Date(course.completionDate), 'dd/MM/yyyy')}</span></CardDetail>
                    <CardDetail>
                        {t('score_card.score_label')}: <span>{((course.score / course.quiz.length) * 100).toFixed(0)}%</span>
                    </CardDetail>
                    <CardButton onClick={() => navigate(`/course/${course._id}/certificate`)}>
                        {t('my_certificates_page.view_certificate_button')}
                    </CardButton>
                  </CardContent>
                </CertificateCard>
              ))}
            </CertificateGrid>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default MyCertificatesPage;
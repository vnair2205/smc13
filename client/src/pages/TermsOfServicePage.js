import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import DOMPurify from 'dompurify';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #333;
`;

const Title = styled.h1`
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
`;

const Content = styled.div`
  line-height: 1.6;
  h2 {
    margin-top: 2rem;
  }
  p {
    margin-bottom: 1rem;
  }
  ul {
    padding-left: 20px;
  }
`;

const LoadingContainer = styled.div`
    text-align: center;
    padding: 3rem;
    font-size: 1.2rem;
`;

const TermsOfServicePage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('/api/legal');
                // Sanitize the HTML content before setting it
                setContent(DOMPurify.sanitize(res.data.termsOfService));
            } catch (error) {
                console.error('Failed to fetch terms of service', error);
                setContent('<p>Could not load Terms of Service at this time. Please try again later.</p>');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <PageContainer>
            <Title>Terms of Service</Title>
            {loading ? (
                 <LoadingContainer>Loading...</LoadingContainer>
            ) : (
                <Content dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </PageContainer>
    );
};

export default TermsOfServicePage;
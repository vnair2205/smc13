import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '../components/layout/AdminLayout';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.h1`
  color: ${({ theme }) => theme.colors.text};
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #ccc;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: ${({ active }) => (active ? '600' : 'normal')};
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.text)};
  border-bottom-color: ${({ theme, active }) => (active ? theme.colors.primary : 'transparent')};
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const EditorContainer = styled.div`
  .ql-editor {
    min-height: 400px;
    background-color: #fff;
    color: #000;
    border-radius: 4px;
  }
`;

const SaveButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
    padding: 3rem;
    text-align: center;
`;

const ErrorMessage = styled.p`
    color: red;
    background-color: #ffeeee;
    border: 1px solid red;
    padding: 1rem;
    border-radius: 5px;
`;

const TermsManagementPage = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const [termsContent, setTermsContent] = useState('');
  const [privacyContent, setPrivacyContent] = useState('');
  
  const [pageLoading, setPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setError('');
        const res = await axios.get('/api/legal');
        if (res.data) {
          setTermsContent(res.data.termsOfService || '');
          setPrivacyContent(res.data.privacyPolicy || '');
        }
      } catch (err) {
        console.error('Failed to fetch legal content', err);
        setError('Failed to load content. Please check the server connection and try again.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        termsOfService: termsContent,
        privacyPolicy: privacyContent,
      };
      await axios.post('/api/legal', payload, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      alert('Content saved successfully!');
    } catch (err) {
      console.error('Failed to save content', err);
      alert('Error saving content.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (pageLoading) {
      return <LoadingContainer>Loading...</LoadingContainer>;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
        <>
            <TabContainer>
                <TabButton active={activeTab === 'terms'} onClick={() => setActiveTab('terms')}>
                    Terms of Service
                </TabButton>
                <TabButton active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')}>
                    Privacy Policy
                </TabButton>
            </TabContainer>

            <EditorContainer>
                {activeTab === 'terms' ? (
                    <ReactQuill theme="snow" value={termsContent} onChange={setTermsContent} />
                ) : (
                    <ReactQuill theme="snow" value={privacyContent} onChange={setPrivacyContent} />
                )}
            </EditorContainer>
            
            <SaveButton onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save All Changes'}
            </SaveButton>
        </>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>Terms and Privacy Policy</Header>
        {renderContent()}
      </Container>
    </AdminLayout>
  );
};

export default TermsManagementPage;
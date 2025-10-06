// admin-panel/src/pages/BlogsPage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import BlogCategoryManager from '../components/blogs/BlogCategoryManager';
import BlogManager from '../components/blogs/BlogManager';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #2a2a3e;
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${({ isActive, theme }) => (isActive ? theme.colors.primary : theme.colors.textSecondary)};
  border-bottom: 2px solid ${({ isActive, theme }) => (isActive ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TabContent = styled.div``;

const BlogsPage = () => {
    const [activeTab, setActiveTab] = useState('blogs');

    return (
        <PageContainer>
            <Header>
                <h1>Blogs & Tips Management</h1>
            </Header>

            <TabContainer>
                <TabButton 
                    isActive={activeTab === 'blogs'} 
                    onClick={() => setActiveTab('blogs')}
                >
                    Blogs
                </TabButton>
                <TabButton 
                    isActive={activeTab === 'category'} 
                    onClick={() => setActiveTab('category')}
                >
                    Category
                </TabButton>
            </TabContainer>

            <TabContent>
                {activeTab === 'category' && (
                    <BlogCategoryManager />
                )}
                {activeTab === 'blogs' && (
                    <BlogManager />
                )}
            </TabContent>
        </PageContainer>
    );
};

export default BlogsPage;
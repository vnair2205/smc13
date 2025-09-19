// admin-panel/src/pages/KnowledgebasePage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import CategoryManager from '../components/knowledgebase/CategoryManager';
import ArticleManager from '../components/knowledgebase/ArticleManager';

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
  margin-bottom: -2px; /* Aligns the border with the container's border */
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TabContent = styled.div`
  /* Styles for the content area can be added here */
`;

// --- MAIN COMPONENT ---
const KnowledgebasePage = () => {
    const [activeTab, setActiveTab] = useState('category');

    return (
        <PageContainer>
            <Header>
                <h1>Knowledge Base Management</h1>
            </Header>

            <TabContainer>
                <TabButton 
                    isActive={activeTab === 'category'} 
                    onClick={() => setActiveTab('category')}
                >
                    Category
                </TabButton>
                <TabButton 
                    isActive={activeTab === 'knowledgebase'} 
                    onClick={() => setActiveTab('knowledgebase')}
                >
                    Knowledge Base
                </TabButton>
            </TabContainer>

            <TabContent>
                {activeTab === 'category' && (
                    // --- 2. RENDER THE CATEGORY MANAGER ---
                    <CategoryManager />
                )}
                {activeTab === 'knowledgebase' && (
                    <div>
                        <h2>Knowledge Base Articles</h2>
                        <p>Here you will create, edit, and manage your knowledge base articles.</p>
                    </div>
                )}

                {activeTab === 'knowledgebase' && (
                    // --- 2. RENDER THE ARTICLE MANAGER ---
                    <ArticleManager />
                )}
            </TabContent>
        </PageContainer>
    );
};

export default KnowledgebasePage;
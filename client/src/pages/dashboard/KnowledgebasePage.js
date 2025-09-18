// client/src/pages/dashboard/KnowledgebasePage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as kbService from '../../services/knowledgebaseService';
import Preloader from '../../components/common/Preloader';
import { FiSearch } from 'react-icons/fi'; // 1. Import the search icon

const PageContainer = styled.div`
  padding: 2rem;
  display: flex;
  gap: 2rem;
`;

const FilterSidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  background-color: #1e1e2d;
  padding: 1.5rem;
  border-radius: 12px;
  align-self: flex-start;
`;

const FilterGroup = styled.div`
  h4 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CategoryButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: ${({ isActive }) => (isActive ? '#2a2a3e' : 'transparent')};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background-color: #2a2a3e;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: #1e1e2d;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  font-size: 1rem;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ArticleCard = styled.div`
  background-color: #1e1e2d;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex; /* Use flexbox */
  flex-direction: column; /* Arrange children vertically */

  h3 { 
    margin-top: 0; 
    color: ${({ theme }) => theme.colors.primary}; 
    flex-grow: 1; /* Allow title to take up available space */
  }
  p { 
    color: #a0a0a0; 
    margin-bottom: 1rem; /* Add some space before the button */
  }
`;

const ViewButton = styled.button`
  margin-top: auto; /* Push the button to the bottom */
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

const KnowledgebasePage = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
      const [searchTerm, setSearchTerm] = useState('');

     const fetchArticles = useCallback(async () => {
        setIsLoading(true);
        try {
            // --- 5. INCLUDE searchTerm IN THE API CALL ---
            const params = { category: selectedCategory, search: searchTerm };
            const res = await kbService.getArticles(params);
            setArticles(res.data);
        } catch (error) {
            console.error("Failed to fetch articles", error);
        }
        setIsLoading(false);
    }, [selectedCategory, searchTerm]); // Add searchTerm to dependency array

   useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await kbService.getCategories();
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

   useEffect(() => {
        // Debounce search input to avoid excessive API calls
        const handler = setTimeout(() => {
            fetchArticles();
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [fetchArticles]);

    return (
       <PageContainer>
            <FilterSidebar>
                {/* --- 6. MOVE THE HEADING HERE --- */}
                <h3>Knowledge Base</h3>
                <FilterGroup>
                    <h4>Categories</h4>
                    <CategoryButton isActive={selectedCategory === ''} onClick={() => setSelectedCategory('')}>
                        All
                    </CategoryButton>
                    {categories.map(cat => (
                        <CategoryButton key={cat._id} isActive={selectedCategory === cat._id} onClick={() => setSelectedCategory(cat._id)}>
                            {cat.name}
                        </CategoryButton>
                    ))}
                </FilterGroup>
            </FilterSidebar>
            <MainContent>
                {/* --- 7. ADD THE SEARCH BAR and REMOVE THE OLD HEADING --- */}
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput 
                        type="text"
                        placeholder="Search articles by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>
                
                {isLoading ? <Preloader /> : (
                    <ArticleGrid>
                        {articles.map(article => (
                            <ArticleCard key={article._id}>
                                <h3>{article.title}</h3>
                                <p>Category: {article.category.name}</p>
                                <ViewButton onClick={() => navigate(`/knowledgebase/article/${article._id}`)}>
                                    View Article
                                </ViewButton>
                            </ArticleCard>
                        ))}
                    </ArticleGrid>
                )}
            </MainContent>
        </PageContainer>
    );
};

export default KnowledgebasePage;
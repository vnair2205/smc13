// client/src/pages/dashboard/KnowledgebasePage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as kbService from '../../services/knowledgebaseService';
import Preloader from '../../components/common/Preloader';
import { FiSearch } from 'react-icons/fi';

// --- STYLED COMPONENTS (with fixes) ---

const PageContainer = styled.div`
    padding: 2rem;
    display: flex;
    gap: 2rem;

    /* --- FIX 1: Stack layout on mobile --- */
    @media (max-width: 992px) {
        flex-direction: column;
        padding: 1rem;
    }
`;

const FilterSidebar = styled.div`
    width: 280px;
    flex-shrink: 0;
    background-color: #1e1e2d;
    padding: 1.5rem;
    border-radius: 12px;
    align-self: flex-start;

    /* --- FIX 2: Hide sidebar on mobile --- */
    @media (max-width: 992px) {
        display: none;
    }
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

// --- FIX 3: New container for mobile filters ---
const MobileFilterContainer = styled.div`
    display: none;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 992px) {
        display: flex;
    }
`;

const CategorySelect = styled.select`
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: #1e1e2d;
    border: 1px solid #444;
    color: white;
    border-radius: 6px;
    font-size: 1rem;
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
    display: flex;
    flex-direction: column;

    h3 { 
        margin-top: 0; 
        color: ${({ theme }) => theme.colors.primary}; 
        flex-grow: 1;
    }
    p { 
        color: #a0a0a0; 
        margin-bottom: 1rem;
    }
`;

const ViewButton = styled.button`
    margin-top: auto;
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
            const params = { category: selectedCategory, search: searchTerm };
            const res = await kbService.getArticles(params);
            setArticles(res.data);
        } catch (error) {
            console.error("Failed to fetch articles", error);
        }
        setIsLoading(false);
    }, [selectedCategory, searchTerm]);

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
        const handler = setTimeout(() => {
            fetchArticles();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [fetchArticles]);

    return (
        <PageContainer>
            <FilterSidebar>
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
                {/* --- FIX 4: Add the mobile filter container --- */}
                <MobileFilterContainer>
                    <SearchContainer>
                        <SearchIcon />
                        <SearchInput 
                            type="text"
                            placeholder="Search articles by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchContainer>
                    <CategorySelect value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </CategorySelect>
                </MobileFilterContainer>

                {/* --- FIX 5: Hide the desktop search bar on mobile --- */}
                <SearchContainer style={{ display: 'block' }} className="desktop-search">
                     <style>{`.desktop-search { display: block; } @media (max-width: 992px) { .desktop-search { display: none; } }`}</style>
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
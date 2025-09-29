// client/src/pages/dashboard/BlogsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as blogService from '../../services/blogService';
import Preloader from '../../components/common/Preloader';
import { FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';

const PageContainer = styled.div`
  padding: 2rem;
  display: flex;
  gap: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const FilterSidebar = styled.aside`
  width: 280px;
  flex-shrink: 0;
  background-color: #1e1e2d;
  padding: 1.5rem;
  border-radius: 12px;
  align-self: flex-start; /* Keeps it from stretching */
`;

const FilterGroup = styled.div`
  h4 {
    margin-top: 0;
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
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #2a2a3e;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem; /* Add padding for the icon */
  background-color: #1e1e2d;
  border: 1px solid #444;
  color: white;
  border-radius: 8px;
  font-size: 1rem;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const BlogCard = styled.div`
  background: #1e1e2d;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardThumbnail = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CardDate = styled.p`
  font-size: 0.9rem;
  color: #a0a0a0;
  margin: 0 0 0.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  flex-grow: 1;
`;

const ReadMoreButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  align-self: flex-start; /* Aligns button to the left */
`;

const BlogsPage = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBlogsAndCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                category: selectedCategory,
                search: searchTerm,
            };
            const [blogsRes, categoriesRes] = await Promise.all([
                blogService.getBlogs(params),
                blogService.getCategories(),
            ]);
            setBlogs(blogsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, searchTerm]);

    useEffect(() => {
        fetchBlogsAndCategories();
    }, [fetchBlogsAndCategories]);

    return (
        <PageContainer>
            <FilterSidebar>
                <FilterGroup>
                    <h4>Categories</h4>
                    <CategoryButton isActive={!selectedCategory} onClick={() => setSelectedCategory('')}>
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
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput
                        type="text"
                        placeholder="Search blogs by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>

                {isLoading ? <Preloader /> : (
                    <BlogGrid>
                        {blogs.length > 0 ? blogs.map(blog => (
                            <BlogCard key={blog._id}>
                                <CardThumbnail src={`http://localhost:5000/${blog.thumbnail}`} alt={blog.title} />
                                <CardContent>
                                    <CardDate>{format(new Date(blog.blogDate), 'MMMM d, yyyy')}</CardDate>
                                    <CardTitle>{blog.title}</CardTitle>
                                    <ReadMoreButton onClick={() => navigate(`/blogs/${blog._id}`)}>
                                        Read More
                                    </ReadMoreButton>
                                </CardContent>
                            </BlogCard>
                        )) : (
                            <p>No blogs found for the selected criteria.</p>
                        )}
                    </BlogGrid>
                )}
            </MainContent>
        </PageContainer>
    );
};

export default BlogsPage;
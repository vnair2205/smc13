import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as preGenApi from '../../services/preGenCourseService';
import * as categoryApi from '../../services/categoryService';
import { FiSearch } from 'react-icons/fi';
import Preloader from '../common/Preloader';
import { languages } from '../../constants/languages'; // Assuming this file exists from admin panel

// --- Styled Components (adapted from MyCoursesPage.js) ---
const TabContentContainer = styled.div`
  display: flex;
  gap: 2rem;
`;
const FilterSidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  background-color: #1e1e2d;
  padding: 1.5rem;
  border-radius: 12px;
`;
const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
  h4 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;
const RadioLabel = styled.label`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  cursor: pointer;
  input {
    margin-right: 0.5rem;
  }
`;
const MainContent = styled.div`
  flex-grow: 1;
`;
const TopFilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;
const InputGroup = styled.div`
  position: relative;
  flex-grow: 1;
`;
const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  width: 100%;
  background-color: #33333e;
  border: 1px solid #444;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
`;
const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const FilterSelect = styled.select`
  padding: 0.75rem;
  background-color: #33333e;
  border: 1px solid #444;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
`;
const CourseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
`;
const CourseCard = styled.div`
    background-color: #2a2a3e;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;
const CardThumbnail = styled.img`
    width: 100%;
    height: 170px;
    object-fit: cover;
    background-color: #333;
`;
const CardContent = styled.div`
    padding: 1rem;
    flex-grow: 1;
`;
const ViewButton = styled(Link)`
    display: block;
    padding: 0.75rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: #000;
    text-align: center;
    text-decoration: none;
    font-weight: bold;
`;


const AllPreGenCoursesTab = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filters, setFilters] = useState({ category: '', subCategory1: '', search: '' });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const coursesRes = await preGenApi.getPreGenCourses(filters);
            setCourses(coursesRes.data.docs || []);
        } catch (error) { console.error("Failed to fetch courses", error); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchCats = async () => {
            const catsRes = await preGenApi.getCategoryCounts();
            setCategories(catsRes.data || []);
        };
        fetchCats();
    }, []);

    const handleCategoryFilterChange = async (e) => {
        const catId = e.target.value;
        setFilters({ ...filters, category: catId, subCategory1: '' });
        if (catId) {
            const res = await categoryApi.getSubCategories1ByParent(catId);
            setSubCategories(res.data);
        } else {
            setSubCategories([]);
        }
    };

    return (
        <TabContentContainer>
            <FilterSidebar>
                <FilterGroup>
                    <h4>Category</h4>
                    <RadioLabel>
                        <label><input type="radio" name="category" value="" onChange={handleCategoryFilterChange} checked={!filters.category} /> All</label>
                    </RadioLabel>
                    {categories.map(cat => (
                        <RadioLabel key={cat._id}>
                            <label><input type="radio" name="category" value={cat._id} onChange={handleCategoryFilterChange} checked={filters.category === cat._id} /> {cat.name}</label>
                            <span>({cat.count})</span>
                        </RadioLabel>
                    ))}
                </FilterGroup>
            </FilterSidebar>
            <MainContent>
                <TopFilterBar>
                    <FilterSelect value={filters.subCategory1} onChange={(e) => setFilters({...filters, subCategory1: e.target.value})} disabled={!filters.category}>
                        <option value="">All Subcategories</option>
                        {subCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                    </FilterSelect>
                    <FilterSelect value={filters.language} onChange={(e) => setFilters({...filters, language: e.target.value})}>
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </FilterSelect>
                    <InputGroup>
                        <SearchIcon />
                        <SearchInput type="text" placeholder="Search courses..." onKeyDown={(e) => e.key === 'Enter' && fetchData()} onChange={(e) => setFilters({...filters, search: e.target.value})} />
                    </InputGroup>
                </TopFilterBar>
                {loading ? <Preloader /> : (
                    <CourseGrid>
                        {courses.map(course => (
                            <CourseCard key={course._id}>
                                <CardThumbnail src={course.thumbnailUrl || 'https://via.placeholder.com/300x170'} alt={course.topic} />
                                <CardContent>
                                    <h4>{course.topic}</h4>
                                    <p>{course.languageName} - {course.numSubtopics} Subtopics</p>
                                </CardContent>
                                <ViewButton to={`/pre-generated-courses/${course._id}`}>View</ViewButton>
                            </CourseCard>
                        ))}
                    </CourseGrid>
                )}
            </MainContent>
        </TabContentContainer>
    );
};



export default AllPreGenCoursesTab;
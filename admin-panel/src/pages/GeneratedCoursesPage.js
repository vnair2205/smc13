import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import * as courseApi from '../services/preGenCourseService';
import * as categoryApi from '../services/categoryService';
import Pagination from '../components/common/Pagination';

const PageContainer = styled.div`
  padding: 2rem;
  width: 100%;
`;
const PageHeader = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
`;
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;
const CourseCard = styled.div`
  background-color: #26262e;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative; /* THIS LINE IS THE FIX */
`;
const CardThumbnail = styled.img`
    width: 100%;
    height: 180px;
    object-fit: cover;
    background-color: #333;
`;
const CardContent = styled.div`
    padding: 1rem;
    flex-grow: 1;
`;
const CardTitle = styled.h3`
    margin-bottom: 0.5rem;
`;
const ViewButton = styled(Link)`
    display: block;
    text-align: center;
    padding: 0.75rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: #fff;
    text-decoration: none;
    font-weight: bold;
`;
const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
`;
const FilterInput = styled.input`
  padding: 0.75rem;
  background-color: #33333e;
  border: 1px solid #444;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  flex-grow: 1;
`;
const FilterSelect = styled.select`
  padding: 0.75rem;
  background-color: #33333e;
  border: 1px solid #444;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;
const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2; /* Ensures it's above the thumbnail */
`;

const GeneratedCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', subCategory1: '', search: '' });
    const [categories, setCategories] = useState([]);
    const [subCategories1, setSubCategories1] = useState([]);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await courseApi.getPreGenCourses(pagination.page, 12, filters);
            setCourses(res.data.docs);
            setPagination({ page: res.data.page, totalPages: res.data.totalPages });
        } catch (error) { console.error("Failed to fetch courses", error); }
        finally { setLoading(false); }
    }, [pagination.page, filters]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        const fetchCats = async () => {
            const res = await categoryApi.getCategories(1, 1000);
            setCategories(res.data.docs);
        };
        fetchCats();
    }, []);

    const handleCategoryFilterChange = async (e) => {
        const catId = e.target.value;
        setFilters({ ...filters, category: catId, subCategory1: '' });
        if (catId) {
            const res = await categoryApi.getSubCategories1ByParent(catId);
            setSubCategories1(res.data);
        } else {
            setSubCategories1([]);
        }
    };
    
    const handleDelete = async (courseId, courseTopic) => {
        if (window.confirm(`Are you sure you want to delete the course "${courseTopic}"?`)) {
            try {
                await courseApi.deletePreGenCourse(courseId);
                fetchCourses(); // Refresh the list
            } catch (error) {
                alert('Failed to delete course.');
            }
        }
    };

    return (
        <PageContainer>
            <PageHeader>Generated Courses</PageHeader>
            <FiltersContainer>
                <FilterSelect value={filters.category} onChange={handleCategoryFilterChange}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </FilterSelect>
                <FilterSelect value={filters.subCategory1} onChange={(e) => setFilters({...filters, subCategory1: e.target.value})} disabled={!filters.category}>
                    <option value="">All Subcategories</option>
                    {subCategories1.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                </FilterSelect>
                <FilterInput 
                    type="text" 
                    placeholder="Search by course topic..." 
                    onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
                    onChange={(e) => setFilters({...filters, search: e.target.value})} 
                />
            </FiltersContainer>

            {loading ? <p>Loading courses...</p> : (
                <>
                    <CardGrid>
                        {courses.map(course => (
                            <CourseCard key={course._id}>
                                <DeleteButton onClick={() => handleDelete(course._id, course.topic)}>
                                    <FiTrash2 />
                                </DeleteButton>
                                <CardThumbnail src={course.thumbnailUrl || 'https://via.placeholder.com/300x180'} alt={course.topic} />
                                <CardContent>
                                    <CardTitle>{course.topic}</CardTitle>
                                    <p>{course.numSubtopics} Subtopics - {course.languageName}</p>
                                </CardContent>
                                <ViewButton to={`/pre-generated-courses/${course._id}`}>View Course</ViewButton>
                            </CourseCard>
                        ))}
                    </CardGrid>
                    <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => setPagination({...pagination, page: p})} />
                </>
            )}
        </PageContainer>
    );
};

export default GeneratedCoursesPage;
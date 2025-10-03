// admin-panel/src/pages/UserGeneratedCoursesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiEye, FiAward } from 'react-icons/fi';
import Preloader from '../components/common/Preloader';
import StatCard from '../components/common/StatCard';
import { format } from 'date-fns';

// --- Styled Components (No Changes Here) ---
const PageContainer = styled.div`
  padding: 2rem;
`;
// ... (keep all other styled components the same as before)
const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    font-weight: 700;
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #2a2a3e;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;

  input {
    background: transparent;
    border: none;
    color: white;
    margin-left: 0.5rem;
    font-size: 1rem;
    width: 100%;
    &:focus {
      outline: none;
    }
  }
`;

const FilterContainer = styled.div`
    select {
        background-color: #2a2a3e;
        color: white;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid #444;
    }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CourseCard = styled.div`
  background-color: #1e1e2d;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const Thumbnail = styled.div`
  height: 180px;
  background-color: #2a2a3e;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #a0a0a0;
    margin-bottom: 0.5rem;
`;

const UserInfo = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #333;
    p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
    }
    .email {
        font-size: 0.8rem;
        color: #a0a0a0;
    }
`;

const CardActions = styled.div`
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex-grow: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  background-color: ${props => props.primary ? '#00bfa6' : '#555'};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

const PaginationControls = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    gap: 1rem;

    button {
        padding: 0.5rem 1rem;
        background-color: #00bfa6;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        &:disabled {
            background-color: #555;
            cursor: not-allowed;
        }
    }
`;


const UserGeneratedCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // V V V THIS IS THE FIX V V V
    const [grandTotal, setGrandTotal] = useState(0); // For the stat card
    // ^ ^ ^ END OF THE FIX ^ ^ ^

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); 
        }, 500); 

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);


    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/admin/user-courses', {
                headers: { 'x-auth-token': token },
                params: { page, limit: 100, search: debouncedSearchTerm, status }
            });
            setCourses(res.data.docs);
            setTotalPages(res.data.totalPages);

            // V V V THIS IS THE FIX V V V
            // If grandTotal is in the response, update our state.
            // It will only be sent on the first, unfiltered load.
            if (res.data.grandTotal !== undefined) {
                setGrandTotal(res.data.grandTotal);
            }
            // If we are on the first page and there are no filters, we can also set the grand total
            // to the totalDocs from this response, to ensure it's always populated initially.
            else if (page === 1 && !debouncedSearchTerm && !status) {
                setGrandTotal(res.data.totalDocs);
            }
            // ^ ^ ^ END OF THE FIX ^ ^ ^

        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearchTerm, status]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);
    
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setPage(1);
    }
    
    const handleViewCourse = (courseId) => {
        window.open(`/admin/view-course/${courseId}`, '_blank');
    };

    const handleViewCertificate = (courseId) => {
         window.open(`/admin/certificate/${courseId}`, '_blank');
    };


    if (loading) return <Preloader />;

    return (
        <PageContainer>
            <Header>
                <h1>User Generated Courses</h1>
            </Header>

            {/* V V V THIS IS THE FIX V V V */}
            <StatCard title="Total Courses" value={grandTotal} />
            {/* ^ ^ ^ END OF THE FIX ^ ^ ^ */}

            <Controls>
                <SearchContainer>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search by Course or User Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>
                <FilterContainer>
                    <select value={status} onChange={handleStatusChange}>
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>
                </FilterContainer>
            </Controls>

            <CourseGrid>
                {courses.map(course => (
                    <CourseCard key={course._id}>
                        <Thumbnail src={course.thumbnailUrl || 'https://via.placeholder.com/300x180'} />
                        <CardContent>
                            <h3>{course.topic}</h3>
                            <InfoRow>
                                <span>{format(new Date(course.createdAt), 'dd MMM yyyy')}</span>
                                <span>{course.languageName}</span>
                                <span>{course.index?.subtopics?.length || 0} Subtopics</span>
                            </InfoRow>
                            <UserInfo>
                                {course.user ? (
                                    <>
                                        <p>{course.user.firstName} {course.user.lastName}</p>
                                        <p className="email">{course.user.email}</p>
                                    </>
                                ) : (
                                    <p className="email">User not found</p>
                                )}
                            </UserInfo>
                        </CardContent>
                        <CardActions>
                            <ActionButton onClick={() => handleViewCourse(course._id)}>
                                <FiEye /> View
                            </ActionButton>
                            {course.status === 'Completed' && (
                                <ActionButton primary onClick={() => handleViewCertificate(course._id)}>
                                    <FiAward /> Certificate
                                </ActionButton>
                            )}
                        </CardActions>
                    </CourseCard>
                ))}
            </CourseGrid>
            
            <PaginationControls>
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
            </PaginationControls>

        </PageContainer>
    );
};

export default UserGeneratedCoursesPage;
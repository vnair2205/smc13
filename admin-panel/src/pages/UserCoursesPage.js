import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { getUserDetails, getUserCourses } from '../services/userService';
import Preloader from '../components/common/Preloader';
import { getCourseDetails } from '../services/courseService';

// --- Styled Components (remain the same) ---
const PageContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.h1`
  margin-bottom: 2rem;
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CourseCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
  
  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    margin: 0.25rem 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const ViewButton = styled.button`
  background-color: #5e72e4;
  color: white;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  margin-top: 1rem;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  width: 100%;
  font-weight: bold;
  
  &:hover {
    background-color: #485cc7;
  }
`;
const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid #33333e;
  background-color: #1e1e32;
  color: white;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 350px;
`;



const UserCoursesPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const [userData, coursesData] = await Promise.all([
                getUserDetails(userId),
                getUserCourses(userId)
            ]);
            
            // 👇 FIX: The user object is returned directly, not nested.
            setUser(userData); 
            setCourses(coursesData);

        } catch (error) {
            console.error('Failed to fetch user or course data', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

 const handleViewCourse = async (courseId) => {
    try {
        const courseDetails = await getCourseDetails(courseId);
        
        // Find the first lesson to navigate to
        if (courseDetails && courseDetails.index && courseDetails.index.subtopics && courseDetails.index.subtopics.length > 0) {
            const firstSubtopic = courseDetails.index.subtopics[0];
            if (firstSubtopic.lessons && firstSubtopic.lessons.length > 0) {
                const firstLesson = firstSubtopic.lessons[0];
                navigate(`/admin/course-player/${courseId}/lesson/${firstSubtopic._id}/${firstLesson._id}`);
            } else {
                alert('This course has no lessons in the first subtopic.');
            }
        } else {
            alert('This course has no subtopics or lessons.');
        }
    } catch (error) {
        console.error('Failed to get course details for navigation', error);
        alert('Could not load the course. Please try again.');
    }
};

    if (loading) return <Preloader />;

    return (
        <PageContainer>
            <Header>Courses for {user ? `${user.firstName} ${user.lastName}` : 'User'}</Header>
            
            {courses.length > 0 ? (
                <CoursesGrid>
                    {courses.map(course => (
                        <CourseCard key={course._id}>
                            <img src={course.thumbnailUrl || '/default-course-thumbnail.png'} alt={course.topic} />
                            <CardContent>
                                <h3>{course.topic}</h3>
                                <p><strong>Status:</strong> {course.status || 'In Progress'}</p>
                                <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
                            </CardContent>
                            <ViewButton onClick={() => handleViewCourse(course._id)}>
                                View Course (Admin)
                            </ViewButton>
                        </CourseCard>
                    ))}
                </CoursesGrid>
            ) : (
                <p>{user ? `${user.firstName} has not created or accessed any courses yet.` : 'No courses found for this user.'}</p>
            )}
        </PageContainer>
    );
};

export default UserCoursesPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getUserDetails, getUserCourses } from '../services/userService';
import Preloader from '../components/common/Preloader';

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

const UserCoursesPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    // --- FIX 1: Initialize 'courses' as an empty array ---
    const [courses, setCourses] = useState([]); 
    const [loading, setLoading] = useState(true);

    const fetchPageData = useCallback(async () => {
        setLoading(true);
        try {
            const [userData, coursesData] = await Promise.all([
                getUserDetails(userId),
                getUserCourses(userId)
            ]);
            
            setUser(userData);
            // --- FIX 2: Ensure coursesData is an array before setting state ---
            // This handles cases where the API might not return the expected object.
            if (Array.isArray(coursesData)) {
                setCourses(coursesData);
            } else if (coursesData && Array.isArray(coursesData.docs)) {
                setCourses(coursesData.docs);
            }

        } catch (error) {
            console.error('Failed to fetch user or course data', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const handleViewCourse = (courseId) => {
        navigate(`/user/${userId}/course/${courseId}`);
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
                                View Course
                            </ViewButton>
                        </CourseCard>
                    ))}
                </CoursesGrid>
            ) : (
                <p>{user ? `${user.firstName} has not created any courses yet.` : 'No courses found for this user.'}</p>
            )}
        </PageContainer>
    );
};

export default UserCoursesPage;
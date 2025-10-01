import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBook, FaCertificate } from 'react-icons/fa';
import { format } from 'date-fns';

import { getUserAllCourses, getUserDetails } from '../services/userService'; // --- 1. IMPORT USER DETAILS FROM userService ---
import Preloader from '../components/common/Preloader';
import AdminLayout from '../components/layout/AdminLayout';

// Styled Components (No changes needed)
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.heading};
    margin: 0;
  }
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const CourseCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const Thumbnail = styled.div`
  height: 180px;
  background-image: url(${props => props.src || 'https://placehold.co/600x400/1e1e32/FFFFFF?text=No+Image'});
  background-size: cover;
  background-position: center;
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CourseTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.heading};
  min-height: 44px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const CourseType = styled.span`
  background-color: ${props => props.type === 'Self-Generated' ? '#3a3a5a' : '#2a5a4a'};
  color: ${props => props.type === 'Self-Generated' ? '#a9a9ff' : '#a9ffdd'};
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 500;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #33333e;
  border-radius: 10px;
  height: 8px;
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
`;

const StatusText = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 1rem 0;
  align-self: flex-end;
`;

const CardFooter = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled(Link)`
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &.view {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  &.certificate {
    background-color: #ffc107;
    color: #1e1e32;
    &:hover {
      background-color: #ffca2c;
    }
  }
`;

const NoCoursesMessage = styled.div`
    text-align: center;
    padding: 4rem;
    background-color: ${({ theme }) => theme.colors.cardBg};
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
`;

const UserCoursesPage = () => {
    const { userId } = useParams();
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [coursesData, userData] = await Promise.all([
                    getUserAllCourses(userId),
                    getUserDetails(userId) // --- 2. USE THE CORRECT FUNCTION ---
                ]);
                setCourses(coursesData);
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user courses data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const getViewLink = (course) => {
        if (course.type === 'Self-Generated') {
            return `/user/${userId}/course/${course._id}`;
        }
        return `/pre-generated-courses/${course._id}?userId=${userId}`;
    };

    if (loading) {
        return <Preloader />;
    }

    return (
        <AdminLayout>
            <PageContainer>
                <PageHeader>
                    <h1>{user ? `${user.firstName} ${user.lastName}'s Courses` : 'User Courses'}</h1>
                    <p>Viewing all self-generated and pre-generated courses for this user.</p>
                </PageHeader>

                {courses.length > 0 ? (
                    <CoursesGrid>
                        {courses.map(course => (
                            <CourseCard key={`${course.type}-${course._id}`}>
                                <Thumbnail src={course.thumbnailUrl} />
                                <CardContent>
                                    <CourseTitle>{course.title}</CourseTitle>
                                    <InfoRow>
                                        <span>{format(new Date(course.date), 'dd MMM yyyy')}</span>
                                        <CourseType type={course.type}>{course.type}</CourseType>
                                    </InfoRow>
                                    <ProgressBarContainer>
                                        <ProgressBar progress={course.progress} />
                                    </ProgressBarContainer>
                                    <StatusText>{Math.round(course.progress)}% Complete</StatusText>
                                    
                                    <CardFooter>
                                        <ActionButton to={getViewLink(course)} className="view">
                                            <FaBook /> View
                                        </ActionButton>
                                        {course.isCompleted && (
                                            <ActionButton to={`/user/${userId}/course/${course._id}/certificate`} className="certificate">
                                                <FaCertificate /> Certificate
                                            </ActionButton>
                                        )}
                                    </CardFooter>
                                </CardContent>
                            </CourseCard>
                        ))}
                    </CoursesGrid>
                ) : (
                    <NoCoursesMessage>
                        <h2>No Courses Found</h2>
                        <p>This user has not generated or accessed any courses yet.</p>
                    </NoCoursesMessage>
                )}
            </PageContainer>
        </AdminLayout>
    );
};
export default UserCoursesPage;
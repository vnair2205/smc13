import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as preGenApi from '../../services/preGenCourseService';
import Preloader from '../../components/common/Preloader';

// --- Styled Components (adapted from CourseOverviewPage.js) ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: calc(100vh - 100px);

  @media (max-width: 768px) {
    padding: 0; /* Remove padding on mobile */
    background-color: transparent; /* Remove background on mobile */
  }
`;

const CourseDetailCard = styled.div`
  background-color: #1e1e2d;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    background-color: transparent;
    padding: 0;
    box-shadow: none;
    border-radius: 0; /* Also remove border-radius if not needed */
  }
`;

const CourseThumbnail = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const CourseTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

const StyledList = styled.ul`
  list-style-type: disc;
  padding-left: 1.5rem;
  li {
    margin-bottom: 0.75rem;
    line-height: 1.6;
    font-size: 1.1rem;
  }
`;

const ActionButton = styled.button`
  display: block;
  width: 100%;
  text-align: center;
  padding: 1rem;
  margin-top: 3rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.9;
  }
`;

const PreGenCourseViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const res = await preGenApi.getPreGenCourseById(id);
                setCourse(res.data);
            } catch (error) {
                console.error("Failed to fetch course details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleStartCourse = async () => {
        try {
            const res = await preGenApi.startCourse(id);
            // Redirect to the normal course player with the new personal course ID
            navigate(`/course/${res.data.courseId}`);
        } catch (error) {
            if (error.response?.data?.courseId) {
                // If user already started it, just redirect them
                navigate(`/course/${error.response.data.courseId}`);
            } else {
                alert("Could not start course.");
            }
        }
    };

    if (loading || !course) return <Preloader />;

    return (
        <PageContainer>
            <CourseDetailCard>
                <CourseThumbnail src={course.thumbnailUrl || 'https://via.placeholder.com/900x400'} alt={course.topic} />
                <CourseTitle>{course.topic}</CourseTitle>

                <section>
                    <SectionTitle>Course Objective</SectionTitle>
                    <StyledList>
                        {course.objective?.map((obj, i) => <li key={i}>{obj}</li>)}
                    </StyledList>
                </section>

                <section>
                    <SectionTitle>Course Outcome</SectionTitle>
                    <StyledList>
                        {course.outcome?.split('\n').map((item, i) => item && <li key={i}>{item}</li>)}
                    </StyledList>
                </section>

                <ActionButton onClick={handleStartCourse}>Start Course</ActionButton>
            </CourseDetailCard>
        </PageContainer>
    );
};

export default PreGenCourseViewPage;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // No longer need Link
import styled from 'styled-components';
import * as courseApi from '../services/preGenCourseService';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: auto;
`;
const PageHeader = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
  text-align: center;
`;
const CourseThumbnail = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 2rem;
  background-color: #333;
`;
const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: 0.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
`;
const StyledList = styled.ul`
  list-style-type: disc;
  padding-left: 2rem;
  li {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    line-height: 1.6;
  }
`;

// --- FIX: Changed from styled(Link) to styled.a ---
const StartButton = styled.a`
  display: block;
  width: 100%;
  text-align: center;
  padding: 1rem;
  margin-top: 3rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer; // Add cursor pointer for better UX
`;

const PreGenCourseViewPage = () => {
    const [course, setCourse] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await courseApi.getPreGenCourseById(id);
                setCourse(res.data);
            } catch (error) {
                console.error("Failed to fetch course", error);
            }
        };
        fetchCourse();
    }, [id]);

    if (!course) return <PageContainer><p>Loading course details...</p></PageContainer>;

    const firstLessonLink = course.index?.subtopics?.[0]?.lessons?.[0]
        ? `/admin/course-player/${course._id}/lesson/${course.index.subtopics[0]._id}/${course.index.subtopics[0].lessons[0]._id}`
        : '#';

    return (
        <PageContainer>
            <PageHeader>{course.topic}</PageHeader>
            <CourseThumbnail src={course.thumbnailUrl || 'https://via.placeholder.com/900x400'} alt={course.topic} />
            
            <section>
                <SectionTitle>Course Objective</SectionTitle>
                <StyledList>
                    {course.objective && course.objective.map((obj, index) => (
                        <li key={index}>{obj}</li>
                    ))}
                </StyledList>
            </section>
            
            <section>
                <SectionTitle>Course Outcome</SectionTitle>
                <StyledList>
                    {course.outcome && course.outcome.split('\n').map((item, index) => (
                        item && <li key={index}>{item}</li>
                    ))}
                </StyledList>
            </section>

            {/* --- FIX: Use href and target="_blank" to open in a new tab --- */}
            <StartButton href={firstLessonLink} target="_blank" rel="noopener noreferrer">
                Start Course
            </StartButton>
        </PageContainer>
    );
};

export default PreGenCourseViewPage;
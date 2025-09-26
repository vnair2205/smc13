// admin-panel/src/pages/AdminLessonContentPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import AdminCourseLayout from '../components/layout/course/AdminCourseLayout';
import Preloader from '../components/common/Preloader';
import { getAdminCourseDetails } from '../services/courseService'; // 👈 We will create this service function
import DOMPurify from 'dompurify';

// --- Styled Components (borrowed from client-side for consistency) ---
const ContentWrapper = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const LessonTitle = styled.h1`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  margin-bottom: 2rem;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 10px;
  }
`;

const LessonContent = styled.div`
  line-height: 1.8;
  font-size: 1.1rem;
  // Add other styles from the client's LessonContentPage.styles.js if you want to match it perfectly
`;

const AdminLessonContentPage = () => {
    const { courseId, subtopicId, lessonId } = useParams();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCourseData = useCallback(async () => {
        try {
            const data = await getAdminCourseDetails(courseId);
            setCourse(data);

            // Find the current lesson from the course data
            for (const subtopic of data.index.subtopics) {
                if (subtopic._id === subtopicId) {
                    const lesson = subtopic.lessons.find(l => l._id === lessonId);
                    if (lesson) {
                        setCurrentLesson(lesson);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch lesson data', error);
            setCourse(null);
        } finally {
            setLoading(false);
        }
    }, [courseId, subtopicId, lessonId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    if (loading) {
        return <Preloader />;
    }

    if (!course || !currentLesson) {
        return <ContentWrapper><h1>Lesson not found.</h1></ContentWrapper>;
    }

    // Sanitize the HTML content before rendering
    const sanitizedContent = DOMPurify.sanitize(currentLesson.content);

    return (
        <AdminCourseLayout course={course} activeLessonId={lessonId}>
            <ContentWrapper>
                <LessonTitle>{currentLesson.title}</LessonTitle>
                
                {currentLesson.videoUrl && (
                    <VideoContainer>
                        <iframe
                            src={currentLesson.videoUrl}
                            title={currentLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </VideoContainer>
                )}
                
                <LessonContent dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </ContentWrapper>
        </AdminCourseLayout>
    );
};

export default AdminLessonContentPage;
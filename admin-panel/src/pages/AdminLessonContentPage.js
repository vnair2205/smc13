import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import * as courseApi from '../services/preGenCourseService';
import AdminCourseLayout from '../components/layout/course/AdminCourseLayout';
import DOMPurify from 'dompurify';

// The course sidebar width is 300px
const COURSE_SIDEBAR_WIDTH = '300px';

const MainContent = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 2rem;
    margin-left: 24px;
    width: calc(100% - ${COURSE_SIDEBAR_WIDTH});
    height: 100vh;
`;

const VideoContainer = styled.div`
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    margin-bottom: 1.5rem;
    border-radius: 12px;
    iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }
`;

const ContentBody = styled.div`
    line-height: 1.8;
    white-space: pre-wrap;
    font-size: 1.1rem;
`;

const AdminLessonContentPage = () => {
    const { id, subtopicId, lessonId } = useParams();
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                const res = await courseApi.getPreGenCourseById(id);
                setCourse(res.data);
                const subtopic = res.data.index.subtopics.find(s => s._id === subtopicId);
                const lessonData = subtopic?.lessons.find(l => l._id === lessonId);
                setLesson(lessonData);
            } catch (error) {
                console.error("Failed to fetch lesson data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [id, subtopicId, lessonId]);

    if (loading || !course) return <p>Loading course...</p>;
    
    return (
        <AdminCourseLayout course={course}>
            <MainContent>
                {loading || !lesson ? (
                    <p>Loading lesson...</p>
                ) : (
                    <>
                        <h2>{lesson.title}</h2>
                        {lesson.videoUrl && (
                            <VideoContainer>
                                <iframe
                                    src={lesson.videoUrl.replace('https://www.youtube.com/embed/$', 'https://www.youtube.com/embed/')}
                                    title={lesson.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </VideoContainer>
                        )}
                        <ContentBody dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content) }} />
                    </>
                )}
            </MainContent>
        </AdminCourseLayout>
    );
};

export default AdminLessonContentPage;
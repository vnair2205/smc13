// admin-panel/src/pages/AdminLessonContentPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Preloader from '../components/common/Preloader';
import Chatbot from '../components/common/Chatbot';
import { FiMessageSquare } from 'react-icons/fi';

// This container now controls the background and fills the entire space.
const PageContainer = styled.div`
  background-color: #12121c;
  min-height: 100%;
  padding: 2.5rem 3.5rem;
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  background-color: #000;
  iframe {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;
  }
`;

const ContentBody = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.8;
  font-size: 1.1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  h1, h2, h3, h4 { color: ${({ theme }) => theme.colors.primary}; margin: 2rem 0 1rem; }
  p { margin-bottom: 1rem; }
  ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
`;

const ChatToggleButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #00bfa6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 191, 166, 0.4);
  z-index: 1000;
`;

const AdminLessonContentPage = () => {
    const { courseId, subtopicId, lessonId } = useParams();
    const { course } = useOutletContext();
    const [chatHistory, setChatHistory] = useState([]);
    const [loadingChat, setLoadingChat] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const lesson = useMemo(() => {
        if (!course?.index?.subtopics) return null;
        const subtopic = course.index.subtopics.find(s => s._id === subtopicId);
        if (!subtopic?.lessons) return null;
        return subtopic.lessons.find(l => l._id === lessonId);
    }, [course, subtopicId, lessonId]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            setLoadingChat(true);
            try {
                const token = localStorage.getItem('adminToken');
                const res = await axios.get(`/api/admin/course-chat/${courseId}`, {
                    headers: { 'x-auth-token': token },
                });
                setChatHistory(res.data);
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            } finally {
                setLoadingChat(false);
            }
        };
        if (courseId) fetchChatHistory();
    }, [courseId]);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (!course) return <Preloader />;
    if (!lesson) return <PageContainer><h2>Lesson not found.</h2></PageContainer>;

    const videoId = getYouTubeId(lesson.videoUrl);

    return (
        <>
            <PageContainer>
                <h1>{lesson.title}</h1>
                {videoId && (
                    <VideoContainer>
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </VideoContainer>
                )}
                <ContentBody dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content || '') }} />
            </PageContainer>
            
            <ChatToggleButton onClick={() => setIsChatOpen(true)}>
                <FiMessageSquare />
            </ChatToggleButton>

            <Chatbot
                chatHistory={chatHistory}
                isReadOnly={true}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </>
    );
};

export default AdminLessonContentPage;
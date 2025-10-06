import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import AdminCourseLayout from '../components/layout/course/AdminCourseLayout';
import LessonContentPage from './AdminLessonContentPage';
import { getCourseForUser, getChatForUserCourse } from '../services/adminUserService';
import Preloader from '../components/common/Preloader'; // Import preloader for better UX

const CourseViewWrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

function AdminCourseViewPage() {
  const { userId, courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await getCourseForUser(userId, courseId);
        setCourse(courseData);

        const chatData = await getChatForUserCourse(userId, courseId);
        setChatHistory(chatData);
      } catch (error) {
        console.error("Error fetching course data for admin:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId && courseId) {
      fetchCourseData();
    } else {
      setLoading(false);
    }
  }, [userId, courseId]);

  if (loading) {
    return <Preloader />;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <AdminCourseLayout course={course} chatHistory={chatHistory}>
      <ContentWrapper>
        <h2>Course Content</h2>
        <p>Select a lesson from the sidebar to view its content.</p>
      </ContentWrapper>
    </AdminCourseLayout>
  );
}

export default AdminCourseViewPage;
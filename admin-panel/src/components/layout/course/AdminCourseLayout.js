// admin-panel/src/components/layout/course/AdminCourseLayout.js
import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import AdminCourseSidebar from './AdminCourseSidebar';
import Preloader from '../../common/Preloader';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

// This component now ONLY handles positioning and scrolling.
const MainContent = styled.main`
  margin-left: 10px; /* This must match the sidebar's width */
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto;
`;

const AdminCourseLayout = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`/api/admin/course-details/${courseId}`, {
          headers: { 'x-auth-token': token }
        });
        setCourse(res.data);
      } catch (error) {
        console.error("Failed to fetch course data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) return <Preloader />;

  return (
    <LayoutContainer>
      <AdminCourseSidebar course={course} />
      <MainContent>
        <Outlet context={{ course }} />
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminCourseLayout;
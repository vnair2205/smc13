// admin-panel/src/components/layout/course/AdminCourseLayout.js
import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import AdminCourseSidebar from './AdminCourseSidebar';
import Preloader from '../../common/Preloader';

// --- FIX: Renamed this component from LayoutContainer ---
const CourseLayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto;
  /* Adjust this margin to account for the fixed sidebar's width */
  margin-left: 300px; 
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
        <CourseLayoutContainer>
            {/* The sidebar will be passed the correct base path */}
            <AdminCourseSidebar course={course} basePath="/admin/view-course" />
            
            <MainContent>
                <Outlet context={{ course }} />
            </MainContent>
        </CourseLayoutContainer>
    );
};

export default AdminCourseLayout;
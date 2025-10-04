import React, { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import * as preGenCourseApi from '../../../services/preGenCourseService';
import AdminCourseSidebar from './AdminCourseSidebar';
import Preloader from '../../common/Preloader';

const CourseLayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SidebarPlaceholder = styled.div`
  width: 300px; /* This should match the sidebar width */
  flex-shrink: 0;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
`;

const PreGenCourseLayout = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await preGenCourseApi.getPreGenCourseById(id);
                setCourse(res.data);
            } catch (error) {
                console.error("Failed to fetch pre-generated course", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id]);

    if (loading) {
        return <Preloader />;
    }

    if (!course) {
        return <div>Course not found.</div>;
    }

    return (
        <CourseLayoutContainer>
            {/* --- FIX: Pass the correct 'basePath' prop --- */}
            <AdminCourseSidebar course={course} basePath="/admin/course-player" />
            <SidebarPlaceholder />
            <MainContent>
                <Outlet context={{ course }} />
            </MainContent>
        </CourseLayoutContainer>
    );
};

export default PreGenCourseLayout;
import React from 'react';
import styled from 'styled-components';
import AdminCourseSidebar from './AdminCourseSidebar';

const CourseLayoutContainer = styled.div`
    display: flex;
    /* This container should take up the full space it's given, not the whole screen */
    width: 100%; 
    height: 100vh;
    position: relative;
`;

const AdminCourseLayout = ({ children, course }) => {
    return (
        // We remove the main admin sidebar here, as the course sidebar takes its place
        <CourseLayoutContainer>
            <AdminCourseSidebar course={course} />
            {children}
        </CourseLayoutContainer>
    );
};

export default AdminCourseLayout;
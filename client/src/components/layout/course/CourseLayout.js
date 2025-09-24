// client/src/components/layout/course/CourseLayout.js

import React, { useState } from 'react'; // <-- FIX: Added useState import
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import CourseSidebar from './CourseSidebar';
import Chatbot from '../../common/Chatbot';
import Notes from '../../common/Notes';
import { useTranslation } from 'react-i18next';
import { FiMenu, FiX } from 'react-icons/fi'; // <-- FIX: Imported the icons

// --- STYLED COMPONENTS ---

const courseSidebarWidth = '300px';
const iconPaddingFromEdge = '20px';

const CourseLayoutContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
`;

const MobileHeader = styled.div`
    display: none; 
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #1e1e2d;
    z-index: 101;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    border-bottom: 1px solid #444;

    @media (max-width: 768px) {
        display: flex;
    }
`;

const ToggleButton = styled.button`
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    margin-right: 1rem;
    z-index: 102;
`;

const CourseTitle = styled.h1`
    font-size: 1.1rem;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const MainContent = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: ${({ theme }) => theme.colors.background};
    padding-top: 80px;
    padding-bottom: 20px;
    
    margin-left: ${({ $isRTL, $showSidebar }) => !$isRTL && $showSidebar ? courseSidebarWidth : '0'};
    margin-right: ${({ $isRTL, $showSidebar }) => $isRTL && $showSidebar ? courseSidebarWidth : '0'};
    transition: margin 0.3s ease-in-out;

    @media (max-width: 768px) {
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding-top: 60px;
    }
`;

const ContentInnerWrapper = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;

    @media (max-width: 768px) {
        padding: 0 1rem;
    }
`;


const CourseLayout = ({ children, course, courseCompletedAndPassed }) => {
    const location = useLocation();
    const { i18n } = useTranslation();
    const isRTL = ['ar', 'ur'].includes(i18n.language);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const hideSidebarPaths = ['/course/quiz', '/dashboard/scorecard'];
    const showSidebar = !hideSidebarPaths.some(path => location.pathname.includes(path));



    return (
        <CourseLayoutContainer dir={isRTL ? 'rtl' : 'ltr'}>
            {showSidebar && <CourseSidebar isRTL={isRTL} course={course} />}

             <MobileHeader>
                {showSidebar && (
                    <ToggleButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <FiX /> : <FiMenu />}
                    </ToggleButton>
                )}
                <CourseTitle>{course?.title}</CourseTitle>
            </MobileHeader>

            <MainContent $isRTL={isRTL} $showSidebar={showSidebar}>
                <ContentInnerWrapper>
                    {children}
                </ContentInnerWrapper>
            </MainContent>

            <Chatbot
                isRTL={isRTL}
                course={course}
                courseCompletedAndPassed={courseCompletedAndPassed}
                fixedSideOffset={iconPaddingFromEdge}
            />

            <CourseSidebar
                    isRTL={isRTL}
                    course={course}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

            {/* <Notes
                courseId={course?._id}
                isRTL={isRTL}
                fixedSideOffset={iconPaddingFromEdge}
            /> */}
        </CourseLayoutContainer>
    );
};

export default CourseLayout;
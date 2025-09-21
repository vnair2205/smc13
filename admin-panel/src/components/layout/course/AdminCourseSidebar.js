import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiDownload, FiCheckCircle, FiAward, FiHome } from 'react-icons/fi';
import logo from '../../../assets/seekmycourse_logo.png';

// (Copy relevant styled-components from your client/src/components/layout/course/CourseSidebar.js)
const expandedWidth = '300px';

const SidebarContainer = styled.div`
  width: 300px; 
  background-color: #1e1e2d;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease-in-out;

  ${({ $isRTL }) => $isRTL ? css`
    right: 0;
    left: unset;
    border-right: none;
    border-left: 1px solid #444;
  ` : css`
    left: 0;
    right: unset;
    border-right: 1px solid #444;
    border-left: none;
  `}
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #444;

  img {
    height: 40px;
    margin-right: 1rem;
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SidebarNav = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 0;
`;

const ProgressBar = styled.div`
  margin: 0 1rem 1rem;
  height: 8px;
  background-color: #444;
  border-radius: 4px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
`;

const ProgressLabel = styled.div`
  margin: 0 1rem 1rem;
  text-align: ${({ dir }) => (dir === 'rtl' ? 'left' : 'right')};
  font-size: 0.9rem;
  color: #a0a0a0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap; 
  width: calc(100% - 2rem);
  margin: 0 1rem 1rem;
  background-color: ${({ primary, theme }) => (primary ? theme.colors.primary : '#555')};
  color: ${({ primary, theme }) => (primary ? theme.colors.background : 'white')};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme, primary }) => (primary ? '#03a092' : '#777')}; 
  }
  &:disabled {
    background-color: #444;
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NavLinkButton = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap; 
  width: calc(100% - 2rem);
  margin: 0 1rem 1rem;
  text-decoration: none;
  background-color: ${({ primary, theme }) => (primary ? theme.colors.primary : '#555')};
  color: ${({ primary, theme }) => (primary ? theme.colors.background : 'white')};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme, primary }) => (primary ? '#03a092' : '#777')}; 
  }
  &:disabled {
    background-color: #555;
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IndexList = styled.div`
  padding: 0 1rem;
  font-size: 0.9rem;
  
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 0.5rem;
  }
`;

const SubtopicTitle = styled.h4`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 0.5rem;
    margin-top: 1rem;
    white-space: normal;
    overflow-wrap: break-word;

    ${({ $isRTL }) => $isRTL && css`
        text-align: right;
    `}
`;

const LessonLink = styled(NavLink)`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #a0a0a0;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #33333d;
  }
  &.active {
    background-color: #33333d;
    color: #fff;
    font-weight: bold;
  }
  &.completed {
    color: ${({ theme }) => theme.colors.primary};
  }

  span {
    flex-grow: 1;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  ${({ $isRTL }) => $isRTL && css`
    flex-direction: row-reverse;
  `}
`;


const AdminCourseSidebar = ({ course }) => {
    if (!course) return null;

    return (
        <SidebarContainer>
            <SidebarNav>
                <h2>Course Index</h2>
                <IndexList>
                    {course.index?.subtopics.map((subtopic, sIndex) => (
                        <div key={subtopic._id || sIndex}>
                            <SubtopicTitle>{`${sIndex + 1}. ${subtopic.title}`}</SubtopicTitle>
                            <ul>
                                {subtopic.lessons.map((lesson, lIndex) => (
                                    <li key={lesson._id || lIndex}>
                                        <LessonLink to={`/admin/course-player/${course._id}/lesson/${subtopic._id}/${lesson._id}`}>
                                            <span>{`${sIndex + 1}.${lIndex + 1} ${lesson.title}`}</span>
                                            {lesson.isCompleted && <FiCheckCircle />}
                                        </LessonLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </IndexList>
            </SidebarNav>
        </SidebarContainer>
    );
};

export default AdminCourseSidebar;
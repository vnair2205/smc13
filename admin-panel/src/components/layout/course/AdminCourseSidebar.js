import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import logo from '../../../assets/seekmycourse_logo.png';

const SidebarContainer = styled.div`
  width: 300px;
  background-color: #1e1e2d;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #444;
  img { height: 40px; }
  h3 { margin: 1rem 0 0; font-size: 1.2rem; line-height: 1.4; }
`;

const SidebarNav = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 0;
`;

const IndexList = styled.div`
  padding: 0 1.5rem;
  ul { list-style: none; padding: 0; }
  li { margin-bottom: 0.5rem; }
`;

const SubtopicTitle = styled.h4`
  color: #00bfa6;
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
`;

const LessonLink = styled(NavLink)`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  color: #a0a0a0;
  text-decoration: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #2a2a3e;
    color: #fff;
  }

  &.active {
    background-color: #33333d;
    color: #fff;
    font-weight: bold;
  }

  span {
    flex-grow: 1;
  }
`;

// --- FIX: Accept a 'basePath' prop ---
const AdminCourseSidebar = ({ course, basePath }) => {
  if (!course || !basePath) return null;

  return (
    <SidebarContainer>
      <SidebarHeader>
        <img src={logo} alt="SeekMyCourse Logo" />
        <h3>{course.topic}</h3>
      </SidebarHeader>
      <SidebarNav>
        <IndexList>
          {course.index?.subtopics.map((subtopic, sIndex) => (
            <div key={subtopic._id || sIndex}>
              <SubtopicTitle>{`${sIndex + 1}. ${subtopic.title}`}</SubtopicTitle>
              <ul>
                {subtopic.lessons.map((lesson, lIndex) => (
                  <li key={lesson._id || lIndex}>
                    {/* --- FIX: Use the dynamic 'basePath' prop to build the URL --- */}
                    <LessonLink to={`${basePath}/${course._id}/lesson/${subtopic._id}/${lesson._id}`}>
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
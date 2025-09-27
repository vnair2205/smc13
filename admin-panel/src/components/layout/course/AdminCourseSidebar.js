import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const SidebarContainer = styled.aside`
  width: 300px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 1.5rem;
  overflow-y: auto;
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const CourseTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
`;

const SubtopicList = styled.ul`
  list-style: none;
  padding: 0;
`;

const SubtopicItem = styled.li`
  margin-bottom: 1rem;
`;

const SubtopicTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const LessonList = styled.ul`
  list-style: none;
  padding-left: 1rem;
`;

const LessonItem = styled.li`
  margin-bottom: 0.5rem;
  a {
    text-decoration: none;
    color: #333;
    &:hover {
      color: #007bff;
    }
  }
`;


const AdminCourseSidebar = ({ course }) => {
  const navigate = useNavigate();

  return (
    <SidebarContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back
      </BackButton>
      <CourseTitle>{course.topic}</CourseTitle>
      <SubtopicList>
        {course.index.subtopics.map((subtopic, sIndex) => (
          <SubtopicItem key={subtopic._id}>
            <SubtopicTitle>{subtopic.title}</SubtopicTitle>
            <LessonList>
              {subtopic.lessons.map((lesson, lIndex) => (
                <LessonItem key={lesson._id}>
                  <Link to={`#`}> {/* Link is disabled for admin view */}
                    {lesson.title}
                  </Link>
                </LessonItem>
              ))}
            </LessonList>
          </SubtopicItem>
        ))}
      </SubtopicList>
    </SidebarContainer>
  );
};

export default AdminCourseSidebar;
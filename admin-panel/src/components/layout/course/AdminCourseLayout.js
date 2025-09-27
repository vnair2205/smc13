import React from 'react';
import styled from 'styled-components';
import AdminCourseSidebar from './AdminCourseSidebar';
import Chatbot from '../../common/Chatbot';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f4f7f9;
`;

const MainContent = styled.main`
  flex-grow: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const AdminCourseLayout = ({ course, chatHistory, children }) => {
  return (
    <LayoutContainer>
      <AdminCourseSidebar course={course} />
      <MainContent>{children}</MainContent>
      {/* The chatbot is in read-only mode by default when no onSendMessage prop is passed */}
      <Chatbot chatHistory={chatHistory} isReadOnly={true} />
    </LayoutContainer>
  );
};

export default AdminCourseLayout;
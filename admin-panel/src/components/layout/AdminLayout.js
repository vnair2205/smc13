import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

// From Sidebar.js, we know the width is 340px
const SIDEBAR_WIDTH = '340px';

const LayoutContainer = styled.div`
  display: flex;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 20px;
  margin-left: ${SIDEBAR_WIDTH};
  width: calc(100% - ${SIDEBAR_WIDTH});
`;

const AdminLayout = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;
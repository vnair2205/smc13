import React from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
`;

const PageButton = styled.button`
  background: ${({ isActive, theme }) => (isActive ? theme.colors.primary : '#33333e')};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <PaginationContainer>
      <PageButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </PageButton>
      {/* You can add page number buttons here if desired */}
      <span style={{ margin: '0 1rem' }}>
        Page {currentPage} of {totalPages}
      </span>
      <PageButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;
import React from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
`;

const PageButton = styled.button`
  background: ${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
  color: ${({ active, theme }) => (active ? '#FFFFFF' : theme.colors.textSecondary)};
  border: 1px solid ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.border)};
  padding: 0.5rem 0.8rem;
  margin: 0 0.2rem;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #FFFFFF;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <PaginationContainer>
      <PageButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <FiChevronLeft />
      </PageButton>
      {pageNumbers.map((number) => (
        <PageButton key={number} active={currentPage === number} onClick={() => onPageChange(number)}>
          {number}
        </PageButton>
      ))}
      <PageButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <FiChevronRight />
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;
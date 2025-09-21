// client/src/components/common/Modal.js
import React from 'react';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi'; // Import a close icon

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
`;

// --- UPDATED MODAL CONTENT ---
// It now accepts a maxWidth prop to allow for wider modals
const ModalContent = styled.div`
  background-color: #2a2a3e;
  padding: 2rem;
  border-radius: 12px;
  width: 95%;
  max-width: ${({ maxWidth }) => maxWidth || '450px'}; // Use prop or default
  text-align: center;
  position: relative; // Needed for positioning the close button
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
`;

// --- NEW CLOSE BUTTON ---
const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;


const ModalTitle = styled.h2`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalText = styled.p`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  span {
    color: ${({ theme }) => theme.colors.white};
    font-weight: 500;
  }
`;

const ModalButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.error : theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};

  &:hover {
    opacity: 0.9;
  }

  &:first-child:not(:last-child) {
      background-color: #4a4a6a;
       &:hover {
        background-color: #5a5a7a;
      }
  }
`;

// --- UPDATED MODAL COMPONENT ---
// Now passes the maxWidth prop and includes the CloseButton
const Modal = ({ children, onClose, isOpen, maxWidth }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent maxWidth={maxWidth} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
            <FiX />
        </CloseButton>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};


export { Modal, ModalTitle, ModalText, ModalButtonContainer, ModalButton };
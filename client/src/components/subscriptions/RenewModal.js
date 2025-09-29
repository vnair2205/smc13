// client/src/components/subscriptions/RenewModal.js
import React from 'react';
import styled from 'styled-components';
import { Modal, ModalTitle } from '../common/Modal';

const ModalContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &.primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &.secondary {
    background-color: #6c757d;
    color: white;
  }
`;

const RenewModal = ({ isOpen, onClose, onRenew }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalTitle>Subscription Expired</ModalTitle>
        <Message>Your plan has ended. Please renew to continue generating and viewing courses.</Message>
        <ButtonGroup>
          <Button className="secondary" onClick={onClose}>Close</Button>
          <Button className="primary" onClick={onRenew}>Renew Plan</Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default RenewModal;
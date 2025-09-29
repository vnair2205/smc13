// client/src/components/subscriptions/QuotaExceededModal.js
import React from 'react';
import { Modal, ModalTitle, ModalText, ModalButtonContainer, ModalButton } from '../common/Modal';

const QuotaExceededModal = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalTitle>Monthly Quota Reached</ModalTitle>
            <ModalText>
                You have used all the course generations included in your current plan.
            </ModalText>
            <ModalText>
                Please wait for your next billing cycle to generate more courses, or upgrade your plan for immediate access.
            </ModalText>
            <ModalButtonContainer>
                <ModalButton onClick={onClose}>Close</ModalButton>
                <ModalButton onClick={onUpgrade}>Upgrade Plan</ModalButton>
            </ModalButtonContainer>
        </Modal>
    );
};

export default QuotaExceededModal;
import React from 'react';
import { Modal, ModalTitle, ModalText, ModalButtonContainer, ModalButton } from '../common/Modal';

const RenewModal = ({ isOpen, onClose, onRenew }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalTitle>Subscription Expired</ModalTitle>
            <ModalText>
                Your subscription has ended. Please renew your plan to continue accessing this feature.
            </ModalText>
            <ModalButtonContainer>
                <ModalButton onClick={onClose}>Close</ModalButton>
                <ModalButton onClick={onRenew}>Renew Plan</ModalButton>
            </ModalButtonContainer>
        </Modal>
    );
};

export default RenewModal;

// client/src/components/profile/SelectionModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
`;

const OptionsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  
  input {
    accent-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.2);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-weight: bold;
  cursor: pointer;
  background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#555')};
  color: ${({ theme, primary }) => (primary ? '#1e1e2d' : 'white')};
`;

const SelectionModal = ({ isOpen, onClose, title, options, selectedItems, onSave }) => {
    const [currentSelections, setCurrentSelections] = useState(selectedItems || []);

    useEffect(() => {
        setCurrentSelections(selectedItems || []);
    }, [selectedItems]);

    const handleCheckboxChange = (option) => {
        setCurrentSelections(prev =>
            prev.includes(option)
                ? prev.filter(item => item !== option)
                : [...prev, option]
        );
    };

    const handleSave = () => {
        onSave(currentSelections);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <h2>{title}</h2>
                <OptionsContainer>
                    {options.map(option => (
                        <CheckboxLabel key={option}>
                            <input
                                type="checkbox"
                                checked={currentSelections.includes(option)}
                                onChange={() => handleCheckboxChange(option)}
                            />
                            {option}
                        </CheckboxLabel>
                    ))}
                </OptionsContainer>
                <ModalActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button primary onClick={handleSave}>Save Selections</Button>
                </ModalActions>
            </ModalContent>
        </Modal>
    );
};

export default SelectionModal;
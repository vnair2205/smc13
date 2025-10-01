import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiXCircle } from 'react-icons/fi';
import instituteService from '../../services/instituteService';

// --- Styled Components ---
const Card = styled.div`
    background-color: ${({ theme }) => theme.colors.lightBackground};
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
`;

const AddButton = styled.button`
    padding: 0.6rem 1.2rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover { opacity: 0.9; }
`;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: #1e1e32;
    color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: #1e1e32;
    color: ${({ theme }) => theme.colors.text};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex-grow: 1;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
    margin-left: 0.5rem;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

// --- Component ---
const SectionCard = ({ sections, classes, instituteId, onUpdate }) => {
    const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [formData, setFormData] = useState({ name: '', classId: '' });

    const handleSave = async () => {
        if (!formData.name || !formData.classId) {
            alert('Please select a class and enter a section name.');
            return;
        }
        try {
            if (editingSectionId) {
                await instituteService.updateSection(editingSectionId, formData);
            } else {
                await instituteService.addSection(instituteId, formData);
            }
            onUpdate();
            resetState();
        } catch (error) {
            console.error("Failed to save section", error);
        }
    };

    const handleDelete = async (sectionId) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            try {
                await instituteService.deleteSection(sectionId);
                onUpdate();
            } catch (error) {
                console.error("Failed to delete section", error);
            }
        }
    };
    
    const resetState = () => {
        setIsAddingOrEditing(false);
        setEditingSectionId(null);
        setFormData({ name: '', classId: '' });
    };

    const startEditing = (section) => {
        setEditingSectionId(section._id);
        setFormData({ name: section.name, classId: section.class._id });
        setIsAddingOrEditing(true);
    };

    const startAdding = () => {
        setEditingSectionId(null);
        setFormData({ name: '', classId: classes[0]?._id || '' });
        setIsAddingOrEditing(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sections</CardTitle>
                <AddButton onClick={startAdding}>
                    <FiPlus /> Add Section
                </AddButton>
            </CardHeader>

            {isAddingOrEditing && (
                <FormContainer>
                    <Select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    >
                        <option value="">-- Select Class --</option>
                        {classes.map(cls => (
                            <option key={cls._id} value={cls._id}>{cls.name}</option>
                        ))}
                    </Select>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter section name"
                    />
                    <ButtonGroup>
                        <AddButton onClick={handleSave} style={{width: '100%'}}> <FiSave/> Save</AddButton>
                        <ActionButton onClick={resetState}><FiXCircle /></ActionButton>
                    </ButtonGroup>
                </FormContainer>
            )}

            <List>
                {sections.map((section) => (
                    <ListItem key={section._id}>
                        <div>
                            <strong>{section.name}</strong>
                            <span style={{ color: '#888', marginLeft: '0.5rem' }}>({section.class?.name || 'N/A'})</span>
                        </div>
                        <div>
                            <ActionButton onClick={() => startEditing(section)}><FiEdit /></ActionButton>
                            <ActionButton onClick={() => handleDelete(section._id)}><FiTrash2 /></ActionButton>
                        </div>
                    </ListItem>
                ))}
                 {sections.length === 0 && !isAddingOrEditing && <p style={{textAlign: 'center', color: '#888'}}>No sections added yet.</p>}
            </List>
        </Card>
    );
};

export default SectionCard;
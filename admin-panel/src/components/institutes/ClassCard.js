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

const InputContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    flex-grow: 1;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: #1e1e32;
    color: ${({ theme }) => theme.colors.text};
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

    &:last-child {
        border-bottom: none;
    }
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
const ClassCard = ({ classes, instituteId, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingClassId, setEditingClassId] = useState(null);
    const [name, setName] = useState('');

    const handleSave = async () => {
        try {
            if (editingClassId) {
                await instituteService.updateClass(editingClassId, { name });
            } else {
                await instituteService.addClass(instituteId, { name });
            }
            onUpdate();
            resetState();
        } catch (error) {
            console.error("Failed to save class", error);
        }
    };

    const handleDelete = async (classId) => {
        if (window.confirm('Are you sure you want to delete this class? This may affect sections and teachers.')) {
            try {
                await instituteService.deleteClass(classId);
                onUpdate();
            } catch (error) {
                console.error("Failed to delete class", error);
            }
        }
    };

    const resetState = () => {
        setIsAdding(false);
        setEditingClassId(null);
        setName('');
    };

    const startEditing = (cls) => {
        setEditingClassId(cls._id);
        setName(cls.name);
        setIsAdding(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Classes</CardTitle>
                <AddButton onClick={() => { setIsAdding(true); setEditingClassId(null); setName(''); }}>
                    <FiPlus /> Add Class
                </AddButton>
            </CardHeader>

            {isAdding && (
                <InputContainer>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter class name" />
                    <ActionButton onClick={handleSave}><FiSave /></ActionButton>
                    <ActionButton onClick={resetState}><FiXCircle /></ActionButton>
                </InputContainer>
            )}

            <List>
                {classes.map((cls) => (
                    <ListItem key={cls._id}>
                        {editingClassId === cls._id ? (
                            <InputContainer>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                                <ActionButton onClick={handleSave}><FiSave /></ActionButton>
                                <ActionButton onClick={resetState}><FiXCircle /></ActionButton>
                            </InputContainer>
                        ) : (
                            <>
                                <span>{cls.name}</span>
                                <div>
                                    <ActionButton onClick={() => startEditing(cls)}><FiEdit /></ActionButton>
                                    <ActionButton onClick={() => handleDelete(cls._id)}><FiTrash2 /></ActionButton>
                                </div>
                            </>
                        )}
                    </ListItem>
                ))}
                {classes.length === 0 && !isAdding && <p style={{textAlign: 'center', color: '#888'}}>No classes added yet.</p>}
            </List>
        </Card>
    );
};

export default ClassCard;
// admin-panel/src/components/team/DesignationManager.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import * as teamService from '../../services/teamService';

// --- STYLED COMPONENTS (Copied from DepartmentManager) ---
const Container = styled.div``;
const AddSection = styled.div` margin-bottom: 2rem; `;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#333')};
  color: ${({ primary }) => (primary ? '#000' : 'white')};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  &:hover { opacity: 0.9; }
`;
const FormContainer = styled.div`
  background-color: #1e1e2d;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  max-width: 500px;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  font-size: 1rem;
`;
const ButtonGroup = styled.div` margin-top: 1rem; display: flex; gap: 1rem; `;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #1e1e2d;
  border-radius: 8px;
  overflow: hidden;
  th, td { padding: 1rem 1.5rem; text-align: left; }
  thead { background-color: #2a2a3e; }
  tbody tr { border-bottom: 1px solid #2a2a3e; &:last-child { border-bottom: none; } }
`;
const ActionButton = styled.button`
  background: none;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  font-size: 1.2rem;
  margin-right: 1rem;
  &:hover {
    color: ${({ theme, danger }) => (danger ? '#ff5b5b' : theme.colors.primary)};
  }
`;

// --- MAIN COMPONENT ---
const DesignationManager = () => {
    const [designations, setDesignations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await teamService.getDesignations();
            setDesignations(res.data);
        } catch (error) {
            console.error("Failed to fetch designations", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!inputValue.trim()) return alert('Designation name cannot be empty.');
        try {
            if (editingItem) {
                await teamService.updateDesignation(editingItem._id, inputValue);
            } else {
                await teamService.addDesignation(inputValue);
            }
            resetForm();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.msg || 'An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this designation?')) {
            try {
                await teamService.deleteDesignation(id);
                fetchData();
            } catch (error) {
                alert('Failed to delete designation.');
            }
        }
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        setInputValue(item.name);
        setIsFormVisible(true);
    };

    const openAddForm = () => {
        setEditingItem(null);
        setInputValue('');
        setIsFormVisible(true);
    };

    const resetForm = () => {
        setIsFormVisible(false);
        setEditingItem(null);
        setInputValue('');
    };

    return (
        <Container>
            <AddSection>
                {!isFormVisible && (
                    <Button primary onClick={openAddForm}><FiPlus /> Add Designation</Button>
                )}
                {isFormVisible && (
                    <FormContainer>
                        <h3>{editingItem ? 'Edit Designation' : 'Add New Designation'}</h3>
                        <Input
                            type="text"
                            placeholder="Enter designation name"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <ButtonGroup>
                            <Button primary onClick={handleSave}>Save</Button>
                            <Button onClick={resetForm}>Cancel</Button>
                        </ButtonGroup>
                    </FormContainer>
                )}
            </AddSection>
            <h2>Existing Designations</h2>
            {isLoading ? <p>Loading...</p> : (
                <Table>
                    <thead><tr><th>Designation Name</th><th>Actions</th></tr></thead>
                    <tbody>
                        {designations.map((desg) => (
                            <tr key={desg._id}>
                                <td>{desg.name}</td>
                                <td>
                                    <ActionButton title="Edit" onClick={() => openEditForm(desg)}><FiEdit /></ActionButton>
                                    <ActionButton title="Delete" danger onClick={() => handleDelete(desg._id)}><FiTrash2 /></ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default DesignationManager;
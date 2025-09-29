// admin-panel/src/components/knowledgebase/CategoryManager.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import * as kbService from '../../services/knowledgebaseService';

// --- STYLED COMPONENTS ---
const Container = styled.div``;

const AddCategorySection = styled.div`
  margin-bottom: 2rem;
`;

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
  
  &:hover {
    opacity: 0.9;
  }
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

const ButtonGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #1e1e2d;
  border-radius: 8px;
  overflow: hidden;

  th, td {
    padding: 1rem 1.5rem;
    text-align: left;
  }

  thead {
    background-color: #2a2a3e;
  }

  tbody tr {
    border-bottom: 1px solid #2a2a3e;
    &:last-child {
      border-bottom: none;
    }
  }
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
const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // Will hold the category object being edited
    const [inputValue, setInputValue] = useState('');

    const fetchCategories = async () => {
        try {
            const res = await kbService.getCategories();
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSave = async () => {
        if (!inputValue) return;

        try {
            if (isEditing) {
                await kbService.updateCategory(isEditing._id, inputValue);
            } else {
                await kbService.addCategory(inputValue);
            }
            resetForm();
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.msg || 'An error occurred');
        }
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await kbService.deleteCategory(categoryId);
                fetchCategories();
            } catch (error) {
                alert('Failed to delete category.');
            }
        }
    };

    const openEditForm = (category) => {
        setIsEditing(category);
        setInputValue(category.name);
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setIsEditing(null);
        setInputValue('');
    };
    
    return (
        <Container>
            <AddCategorySection>
                {!isAdding && (
                    <Button primary onClick={() => setIsAdding(true)}>
                        <FiPlus /> Add Category
                    </Button>
                )}
                {isAdding && (
                    <FormContainer>
                        <Input
                            type="text"
                            placeholder="Enter category name"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <ButtonGroup>
                            <Button primary onClick={handleSave}>Save</Button>
                            <Button onClick={resetForm}>Cancel</Button>
                        </ButtonGroup>
                    </FormContainer>
                )}
            </AddCategorySection>

            <h2>Existing Categories</h2>
            {isLoading ? <p>Loading...</p> : (
                <Table>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id}>
                                <td>{cat.name}</td>
                                <td>
                                    <ActionButton onClick={() => openEditForm(cat)}>
                                        <FiEdit />
                                    </ActionButton>
                                    <ActionButton danger onClick={() => handleDelete(cat._id)}>
                                        <FiTrash2 />
                                    </ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default CategoryManager;
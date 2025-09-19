// admin-panel/src/components/support/SupportCategoryManager.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import * as supportService from '../../services/supportService';

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
const SupportCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); // Will hold the category object being edited
    const [inputValue, setInputValue] = useState('');

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await supportService.getCategories();
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
        if (!inputValue.trim()) {
            alert('Category name cannot be empty.');
            return;
        }

        try {
            if (editingCategory) {
                await supportService.updateCategory(editingCategory._id, inputValue);
            } else {
                await supportService.addCategory(inputValue);
            }
            resetForm();
            fetchCategories(); // Refresh the list
        } catch (error) {
            alert(error.response?.data?.msg || 'An error occurred');
        }
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                await supportService.deleteCategory(categoryId);
                fetchCategories(); // Refresh the list
            } catch (error) {
                alert('Failed to delete category.');
            }
        }
    };

    const openEditForm = (category) => {
        setEditingCategory(category);
        setInputValue(category.name);
        setIsFormVisible(true);
    };

    const openAddForm = () => {
        setEditingCategory(null);
        setInputValue('');
        setIsFormVisible(true);
    };

    const resetForm = () => {
        setIsFormVisible(false);
        setEditingCategory(null);
        setInputValue('');
    };
    
    return (
        <Container>
            <AddCategorySection>
                {!isFormVisible && (
                    <Button primary onClick={openAddForm}>
                        <FiPlus /> Add Category
                    </Button>
                )}
                {isFormVisible && (
                    <FormContainer>
                        <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
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
            {isLoading ? <p>Loading categories...</p> : (
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
                                    <ActionButton title="Edit" onClick={() => openEditForm(cat)}>
                                        <FiEdit />
                                    </ActionButton>
                                    <ActionButton title="Delete" danger onClick={() => handleDelete(cat._id)}>
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

export default SupportCategoryManager;
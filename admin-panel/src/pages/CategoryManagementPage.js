import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiPlus, FiUpload, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';
import * as api from '../services/categoryService';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';

// --- (Keep all your existing styled-components here) ---
const PageContainer = styled.div`
  padding: 2rem;
  width: 100%;
`;
const PageHeader = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2rem;
`;
const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #33333e;
  margin-bottom: 2rem;
`;
const TabButton = styled.button`
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.textSecondary)};
  border-bottom: 3px solid ${({ theme, isActive }) => (isActive ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  transition: all 0.2s ease-in-out;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;
const ContentArea = styled.div`
  background-color: #1e1e2d;
  padding: 2rem;
  border-radius: 8px;
`;
const ActionHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
`;
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => (variant === 'secondary' ? '#33333e' : theme.colors.primary)};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const ModalTitle = styled.h2`
  margin-bottom: 1.5rem;
`;
const FormGroup = styled.div`
  margin-bottom: 1rem;
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  input, select {
    width: 100%;
    padding: 0.75rem;
    background-color: #33333e;
    border: 1px solid #444;
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }
`;
const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;
const ActionsContainer = styled.div`
    display: flex;
    gap: 1rem;
    button {
        background: none;
        border: none;
        color: ${({ theme }) => theme.colors.textSecondary};
        cursor: pointer;
        font-size: 1.2rem;
        &:hover { color: ${({ theme }) => theme.colors.primary}; }
    }
`;



 const CategoryManagementPage = () => {
    const [activeTab, setActiveTab] = useState('category');
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({});
    const [allCategories, setAllCategories] = useState([]);
    const [filteredSubCategories1, setFilteredSubCategories1] = useState([]); // New state for cascading dropdown
    const [selectedFile, setSelectedFile] = useState(null);
     const [editingItem, setEditingItem] = useState(null);

      const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'category') res = await api.getCategories(pagination.page);
            else if (activeTab === 'subcategory1') res = await api.getSubCategories1(pagination.page);
            else if (activeTab === 'subcategory2') res = await api.getSubCategories2(pagination.page);
            
            if(res) {
                setData(res.data.docs);
                setPagination({ page: res.data.page, totalPages: res.data.totalPages, });
            }

            // Always fetch all categories for the dropdowns
            const allCatsRes = await api.getCategories(1, 1000);
            setAllCategories(allCatsRes.data.docs);

        } catch (error) {
            console.error("Failed to fetch data", error);
            alert("Could not fetch data.");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Reset page to 1 when tab changes
    useEffect(() => {
        setPagination(p => ({ ...p, page: 1 }));
    }, [activeTab]);


    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(p => ({ ...p, page: newPage }));
        }
    };

    

   const handleOpenModal = () => {
        setEditingItem(null); // Ensure we are in "create" mode
        setFormData({});
        setFilteredSubCategories1([]);
        setIsModalOpen(true);
    };

   const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) { // If editingItem is set, we UPDATE
                if (activeTab === 'category') await api.updateCategory(editingItem._id, { name: formData.name });
                else if (activeTab === 'subcategory1') await api.updateSubCategory1(editingItem._id, { name: formData.name, parentCategory: formData.parentCategory });
                else if (activeTab === 'subcategory2') await api.updateSubCategory2(editingItem._id, { name: formData.name, parentSubCategory1: formData.parentSubCategory1 });
            } else { // Otherwise, we CREATE
                if (activeTab === 'category') await api.createCategory({ name: formData.name });
                else if (activeTab === 'subcategory1') await api.createSubCategory1({ name: formData.name, parentCategory: formData.parentCategory });
                else if (activeTab === 'subcategory2') await api.createSubCategory2({ name: formData.name, parentSubCategory1: formData.parentSubCategory1 });
            }
            setIsModalOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) { alert('Failed to save. Item may already exist.'); }
    };


    const handleEdit = async (item) => {
        setEditingItem(item); // Set the item to be edited
        // Pre-populate form data
        if (activeTab === 'category') {
            setFormData({ name: item.name });
        } else if (activeTab === 'subcategory1') {
            setFormData({ name: item.name, parentCategory: item.parentCategory._id });
        } else if (activeTab === 'subcategory2') {
            // Pre-select the parent category and fetch its subcategories
            await handleParentCategoryChange({ target: { value: item.parentSubCategory1.parentCategory._id } });
            setFormData({
                name: item.name,
                parentCategory: item.parentSubCategory1.parentCategory._id,
                parentSubCategory1: item.parentSubCategory1._id,
            });
        }
        setIsModalOpen(true);
    };

     // --- NEW: Delete Handler ---
    const handleDelete = async (item) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${item.name}"? This will also delete all associated subcategories.`);
        if (confirmDelete) {
            try {
                if (activeTab === 'category') await api.deleteCategory(item._id);
                else if (activeTab === 'subcategory1') await api.deleteSubCategory1(item._id);
                else if (activeTab === 'subcategory2') await api.deleteSubCategory2(item._id);
                fetchData(); // Refresh data
            } catch (error) {
                alert('Failed to delete item.');
            }
        }
    };

    

    
    const handleBulkUpload = async () => {
        if (!selectedFile) return alert('Please select a file to upload.');
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        try {
            await api.bulkUpload(uploadData);
            setIsBulkModalOpen(false);
            fetchData();
            alert('Bulk upload successful!');
        } catch (error) {
            alert('Bulk upload failed.');
        }
    };

    const handleDownloadTemplate = () => {
        const headers = "Category Name,Sub Category 1 Name,Sub Category 2 Name";
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "category_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleParentCategoryChange = async (e) => {
        const parentId = e.target.value;
        setFormData({ ...formData, parentCategory: parentId, parentSubCategory1: '' }); 
        if (parentId) {
            try {
                const res = await api.getSubCategories1ByParent(parentId);
                setFilteredSubCategories1(res.data);
            } catch (error) {
                console.error("Failed to fetch subcategories", error);
                setFilteredSubCategories1([]);
            }
        } else {
            setFilteredSubCategories1([]);
        }
    };

     const getColumns = () => {
         const baseColumns = [
            {
                title: 'Actions', key: 'actions', render: (row) => (
                    <ActionsContainer>
                        <button onClick={() => handleEdit(row)}><FiEdit /></button>
                        <button onClick={() => handleDelete(row)}><FiTrash2 /></button>
                    </ActionsContainer>
                )
            }
        ];
        
        if (activeTab === 'category') {
            return [{ title: 'Category Name', key: 'name' }, ...baseColumns];
        }
        if (activeTab === 'subcategory1') {
            return [
                { title: 'Subcategory 1 Name', key: 'name' },
                { title: 'Parent Category', key: 'parentCategory', render: (row) => row.parentCategory?.name || 'N/A' },
                ...baseColumns
            ];
        }
        if (activeTab === 'subcategory2') {
            return [
                { title: 'Subcategory 2 Name', key: 'name' },
                { title: 'Parent Subcategory 1', key: 'parentSubCategory1', render: (row) => row.parentSubCategory1?.name || 'N/A' },
                { title: 'Parent Category', key: 'parentCategory', render: (row) => row.parentSubCategory1?.parentCategory?.name || 'N/A' },
                ...baseColumns
            ];
        }
        return [];
    };

    const renderModalContent = () => {
        if (activeTab === 'category') {
            return (
                <FormGroup>
                    <label>Category Name</label>
                    <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </FormGroup>
            );
        }
        if (activeTab === 'subcategory1') {
            return (
                <>
                    <FormGroup>
                        <label>Parent Category</label>
                        <select value={formData.parentCategory || ''} onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })} required>
                            <option value="">Select Category</option>
                            {allCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Subcategory 1 Name</label>
                        <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </FormGroup>
                </>
            );
        }
   if (activeTab === 'subcategory2') {
            return (
                <>
                    <FormGroup>
                        <label>Parent Category</label>
                        <select value={formData.parentCategory || ''} onChange={handleParentCategoryChange} required>
                            <option value="">Select Category</option>
                            {allCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Parent Subcategory 1</label>
                        <select 
                            value={formData.parentSubCategory1 || ''} 
                            onChange={(e) => setFormData({ ...formData, parentSubCategory1: e.target.value })} 
                            required
                            disabled={!formData.parentCategory || filteredSubCategories1.length === 0}
                        >
                            <option value="">Select Subcategory 1</option>
                            {filteredSubCategories1.map(subCat => <option key={subCat._id} value={subCat._id}>{subCat.name}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Subcategory 2 Name</label>
                        <input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </FormGroup>
                </>
            );
        }
        return null;
    };
    

    return (
        <PageContainer>
            <PageHeader>Category Management</PageHeader>
            <TabContainer>
                <TabButton isActive={activeTab === 'category'} onClick={() => setActiveTab('category')}>Category</TabButton>
                <TabButton isActive={activeTab === 'subcategory1'} onClick={() => setActiveTab('subcategory1')}>Subcategory 1</TabButton>
                <TabButton isActive={activeTab === 'subcategory2'} onClick={() => setActiveTab('subcategory2')}>Subcategory 2</TabButton>
            </TabContainer>
            <ContentArea>
                <ActionHeader>
                    <StyledButton onClick={() => setIsBulkModalOpen(true)} variant="secondary" style={{ marginRight: '1rem' }}><FiUpload /> Bulk Upload</StyledButton>
                    <StyledButton onClick={handleOpenModal}><FiPlus /> Add {activeTab === 'category' ? 'Category' : activeTab === 'subcategory1' ? 'Subcategory 1' : 'Subcategory 2'}</StyledButton>
                </ActionHeader>
                {loading ? <p>Loading...</p> : <DataTable columns={getColumns()} data={data} />}
                {!loading && data.length > 0 && <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />}
            </ContentArea>
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }}>
                <form onSubmit={handleFormSubmit}>
                    <ModalTitle>{editingItem ? 'Edit' : 'Add New'} {activeTab === 'category' ? 'Category' : activeTab === 'subcategory1' ? 'Subcategory 1' : 'Subcategory 2'}</ModalTitle>
                    {renderModalContent()}
                    <ModalActions>
                        <StyledButton type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setEditingItem(null); }}>Cancel</StyledButton>
                        <StyledButton type="submit">Save</StyledButton>
                    </ModalActions>
                </form>
            </Modal>
          <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)}>
                <ModalTitle>Bulk Upload Categories</ModalTitle>
                <p>Download the CSV template, fill it out, and upload it here. The system will handle duplicates automatically.</p>
                <StyledButton onClick={handleDownloadTemplate} variant="secondary" style={{ marginBottom: '1.5rem' }}><FiDownload /> Download Template</StyledButton>
                <FormGroup>
                    <label>Upload CSV File</label>
                    <input type="file" accept=".csv" onChange={(e) => setSelectedFile(e.target.files[0])} />
                </FormGroup>
                <ModalActions>
                    <StyledButton type="button" variant="secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</StyledButton>
                    <StyledButton onClick={handleBulkUpload}>Upload and Process</StyledButton>
                </ModalActions>
            </Modal>
        </PageContainer>
    );
};


export default CategoryManagementPage;
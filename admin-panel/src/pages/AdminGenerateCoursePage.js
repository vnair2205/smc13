import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiUpload, FiDownload } from 'react-icons/fi';
import * as categoryApi from '../services/categoryService';
import * as courseApi from '../services/preGenCourseService';
import Modal from '../components/common/Modal';
import { languages } from '../constants/languages';



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
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

const AdminGenerateCoursePage = () => {
    const [formData, setFormData] = useState({
        language: 'en',
        languageName: 'English',
        nativeName: 'English',
        numSubtopics: 5
    });
    const [allCategories, setAllCategories] = useState([]);
    const [filteredSubCategories1, setFilteredSubCategories1] = useState([]);
    const [filteredSubCategories2, setFilteredSubCategories2] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState({
        language: 'en',
        languageName: 'English',
        nativeName: 'English',
        numSubtopics: 5
    });
    const [selectedFile, setSelectedFile] = useState(null);

    // Fetch categories for dropdowns
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await categoryApi.getCategories(1, 1000);
                setAllCategories(res.data.docs);
            } catch (error) {
                console.error("Could not fetch categories for dropdowns", error);
            }
        };
        fetchInitialData();
    }, []);

    const handleLanguageChange = (e, formType = 'single') => {
        const selectedLang = languages.find(lang => lang.code === e.target.value);
        if (selectedLang) {
            const data = {
                language: selectedLang.code,
                languageName: selectedLang.name,
                nativeName: selectedLang.nativeName,
            };
            if (formType === 'bulk') {
                setBulkFormData(prev => ({ ...prev, ...data }));
            } else {
                setFormData(prev => ({ ...prev, ...data }));
            }
        }
    };

    const handleParentCategoryChange = async (e) => {
        const parentId = e.target.value;
        setFormData(prev => ({ ...prev, category: parentId, subCategory1: '', subCategory2: '' }));
        setFilteredSubCategories1([]);
        setFilteredSubCategories2([]);
        if (parentId) {
            try {
                const res = await categoryApi.getSubCategories1ByParent(parentId);
                setFilteredSubCategories1(res.data);
            } catch (error) {
                console.error("Could not fetch subcategories 1", error);
            }
        }
    };

    const handleSubCategory1Change = async (e) => {
        const parentId = e.target.value;
        setFormData(prev => ({ ...prev, subCategory1: parentId, subCategory2: '' }));
        setFilteredSubCategories2([]);
        if (parentId) {
            try {
                const res = await categoryApi.getSubCategories2ByParent(parentId);
                setFilteredSubCategories2(res.data);
            } catch (error) {
                console.error("Could not fetch subcategories 2", error);
            }
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await courseApi.createPreGenCourse(formData);
            alert('Course generated successfully!');
            setFormData(prev => ({ 
                ...{ language: 'en', languageName: 'English', nativeName: 'English', numSubtopics: 5 },
                language: prev.language, languageName: prev.languageName, nativeName: prev.nativeName,
            }));
        } catch (error) {
            alert('Error generating course.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) return alert('Please select a CSV file.');
        setLoading(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        
        Object.keys(bulkFormData).forEach(key => {
            uploadData.append(key, bulkFormData[key]);
        });
        
        try {
            await courseApi.bulkGenerateCourses(uploadData);
            alert('Bulk course generation started successfully!');
            setIsBulkModalOpen(false);
        } catch (error) {
            alert('Error starting bulk generation.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = "Category Name,Sub Category 1 Name,Sub Category 2 Name,Course Topic,Number of Subtopics";
        const exampleRow = "Technology,Web Development,React,Advanced React Hooks,10";
        const csvContent = `${headers}\n${exampleRow}`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "bulk_course_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <PageContainer>
            <PageHeader>Generate Pre-Made Course</PageHeader>
            <ActionHeader>
                <StyledButton onClick={() => setIsBulkModalOpen(true)}>
                    <FiUpload /> Bulk Upload Courses
                </StyledButton>
            </ActionHeader>

            <ContentArea as="form" onSubmit={handleSubmit}>
                <FormGrid>
                    <FormGroup>
                        <label>Language</label>
                        <select value={formData.language} onChange={(e) => handleLanguageChange(e, 'single')}>
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Number of Subtopics</label>
                        <select value={formData.numSubtopics} onChange={e => setFormData({...formData, numSubtopics: e.target.value})}>
                            <option value={5}>5 Subtopics</option>
                            <option value={10}>10 Subtopics</option>
                            <option value={15}>15 Subtopics</option>
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Category</label>
                        <select value={formData.category || ''} onChange={handleParentCategoryChange} required>
                            <option value="">Select Category</option>
                            {allCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Subcategory 1</label>
                        <select value={formData.subCategory1 || ''} onChange={handleSubCategory1Change} required disabled={!formData.category || filteredSubCategories1.length === 0}>
                           <option value="">Select Subcategory 1</option>
                           {filteredSubCategories1.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Subcategory 2</label>
                        <select value={formData.subCategory2 || ''} onChange={e => setFormData({...formData, subCategory2: e.target.value})} required disabled={!formData.subCategory1 || filteredSubCategories2.length === 0}>
                            <option value="">Select Subcategory 2</option>
                            {filteredSubCategories2.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                        </select>
                    </FormGroup>
                </FormGrid>
                <FormGroup>
                    <label>Course Title</label>
                    <input type="text" value={formData.topic || ''} placeholder="e.g., Introduction to JavaScript" onChange={e => setFormData({...formData, topic: e.target.value})} required />
                </FormGroup>
                
                <StyledButton type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Course'}
                </StyledButton>
            </ContentArea>
            
           <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)}>
                <ModalTitle>Bulk Upload & Generate Courses</ModalTitle>
                <p>Download the template, fill it out with your course details, and upload it here.</p>
                
                <StyledButton 
                    onClick={handleDownloadTemplate} 
                    variant="secondary" 
                    style={{ marginBottom: '1.5rem', width: '100%' }}
                >
                    <FiDownload /> Download Template
                </StyledButton>

                <FormGroup>
                    <label>Language for All Courses in CSV</label>
                    <select value={bulkFormData.language} onChange={(e) => handleLanguageChange(e, 'bulk')}>
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </FormGroup>
                <FormGroup>
                    <label>Upload CSV File</label>
                    <input type="file" accept=".csv" onChange={(e) => setSelectedFile(e.target.files[0])} />
                </FormGroup>
                <ModalActions>
                    <StyledButton variant="secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</StyledButton>
                    <StyledButton onClick={handleBulkUpload} disabled={loading}>
                        {loading ? 'Processing...' : 'Upload & Generate'}
                    </StyledButton>
                </ModalActions>
            </Modal>
        </PageContainer>
    );
};

export default AdminGenerateCoursePage;
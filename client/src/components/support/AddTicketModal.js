// client/src/components/support/AddTicketModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as supportService from '../../services/supportService';
import { useTranslation } from 'react-i18next';
import Preloader from '../common/Preloader';

// --- STYLED COMPONENTS (No changes) ---
const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1010;
`;
const ModalContent = styled.div`
  background: #1e1e2d;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  color: ${({ theme }) => theme.colors.text};
  position: relative;
`;
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  label { display: block; margin-bottom: 0.5rem; }
`;
const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
  min-height: 120px;
`;
const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background-color: ${({ primary, theme }) => primary ? theme.colors.primary : '#2a2a3e'};
  color: ${({ primary }) => primary ? '#000' : '#fff'};

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;
const PreloaderOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(30, 30, 45, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 8px;
`;

const AddTicketModal = ({ onClose, onTicketCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'Medium',
    attachments: [],
  });

  // --- 1. ADDED DEDICATED STATE FOR CATEGORIES ---
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityOptions = [
    { value: 'Low', label: t('Low') },
    { value: 'Medium', label: t('Medium') },
    { value: 'High', label: t('High') }
  ];

  // --- 2. REVISED USEEFFECT FOR ROBUST DATA FETCHING ---
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const data = await supportService.getCategories();
        
        // Ensure the response is an array
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, category: data[0]._id }));
          }
        } else {
          // If data is not an array, it's an unexpected response
          throw new Error("Category data is not in the expected format.");
        }

      } catch (error) {
        console.error("Failed to fetch support categories", error);
        setCategoriesError("Could not load categories. Please try again later.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'attachments') {
          for (let i = 0; i < formData.attachments.length; i++) {
            data.append('attachments', formData.attachments[i]);
          }
        } else {
          data.append(key, formData[key]);
        }
      });
      
      await supportService.createTicket(data);
      onTicketCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create ticket", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop>
      <ModalContent>
        {isSubmitting && (
            <PreloaderOverlay>
                <Preloader />
            </PreloaderOverlay>
        )}
        <h2>Create New Support Ticket</h2>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="category">Category</label>
            <Select id="category" name="category" value={formData.category} onChange={handleChange} required>
              {/* --- 3. REVISED DROPDOWN LOGIC TO SHOW LOADING/ERROR STATES --- */}
              {categoriesLoading && <option>Loading categories...</option>}
              {categoriesError && <option>{categoriesError}</option>}
              {!categoriesLoading && !categoriesError && (
                categories.length > 0 ? (
                  categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)
                ) : (
                  <option>No categories found</option>
                )
              )}
            </Select>
          </FormGroup>
          <FormGroup>
            <label htmlFor="subject">Subject</label>
            <Input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <label htmlFor="description">Describe the issue</label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <label htmlFor="attachments">Attachments</label>
            <Input 
              id="attachments" 
              name="attachments" 
              type="file" 
              multiple
              onChange={handleFileChange}
              accept="image/*, .pdf, .doc, .docx, .txt"
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="priority">Priority</label>
            <Select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
              {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </FormGroup>
          <ButtonGroup>
            <Button type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" primary disabled={isSubmitting || categoriesLoading || categoriesError}>
              {isSubmitting ? 'Saving...' : 'Save Ticket'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AddTicketModal;
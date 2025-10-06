// client/src/components/support/AddTicketModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as supportService from '../../services/supportService';
import { useTranslation } from 'react-i18next';

// --- STYLED COMPONENTS (No changes here) ---
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
  border-radius: 6px;
`;
const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  min-height: 120px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background-color: ${({ primary, theme }) => primary ? theme.colors.primary : '#2a2a3e'};
  color: ${({ primary }) => primary ? '#000' : 'white'};
  &:disabled { background-color: #555; cursor: not-allowed; } // Style for disabled button
`;


const AddTicketModal = ({ onClose, onTicketCreated }) => {
  const { t } = useTranslation();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // --- FIX: Add submitting state
  
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'Medium',
  });
  const [attachments, setAttachments] = useState([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const { data } = await supportService.getCategories(); //
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0]._id }));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const priorityOptions = [
    { value: 'Low', label: t('Low') },
    { value: 'Medium', label: t('Medium') },
    { value: 'High', label: t('High') },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Please select a category.");
      return;
    }

    setIsSubmitting(true); // --- FIX: Set submitting to true
    const ticketData = new FormData();
    Object.keys(formData).forEach(key => ticketData.append(key, formData[key]));
    attachments.forEach(file => ticketData.append('attachments', file));
    
    try {
      await supportService.createTicket(ticketData); //
      onTicketCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false); // --- FIX: Set submitting back to false
    }
  };

  return (
    <ModalBackdrop>
      <ModalContent>
        <h2>Create New Support Ticket</h2>
        <form onSubmit={handleSubmit}>
          {/* Form Groups remain the same */}
          <FormGroup>
            <label htmlFor="category">Category</label>
            <Select id="category" name="category" value={formData.category} onChange={handleChange} required disabled={isLoading}>
              {isLoading ? (
                <option>Loading...</option>
              ) : categories.length > 0 ? (
                categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)
              ) : (
                <option>No categories available</option>
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
            <Button type="button" onClick={onClose}>Cancel</Button>
            {/* --- FIX: Update button to show loading state --- */}
            <Button type="submit" primary disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Ticket'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AddTicketModal;
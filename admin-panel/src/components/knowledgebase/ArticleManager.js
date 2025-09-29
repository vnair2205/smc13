// admin-panel/src/components/knowledgebase/ArticleManager.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles for the editor
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import * as kbService from '../../services/knowledgebaseService';
import { useNavigate } from 'react-router-dom';

// --- STYLED COMPONENTS ---
const Container = styled.div``;
const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;
const Filters = styled.div`
  display: flex;
  gap: 1rem;
`;
const Select = styled.select` /* Add styling for select */
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const Input = styled.input`
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;
const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;
const ArticleCard = styled.div`
  background-color: #1e1e2d;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  h3 { margin-top: 0; }
`;
const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #2a2a3e;
  display: flex;
  gap: 0.5rem;
`;
// Modal Styles
const ModalBackdrop = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
`;
const ModalContent = styled.div`
  background-color: #1e1e2d;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  label { display: block; margin-bottom: 0.5rem; }
`;
const ModalButtonGroup = styled.div`
  display: flex; gap: 1rem; margin-top: 1.5rem;
`;

// --- MAIN COMPONENT ---
const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({ category: '', title: '', youtubeUrl: '', content: '' });
  const [filters, setFilters] = useState({ category: '', search: '' });
    const navigate = useNavigate();

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await kbService.getArticles(filters);
      setArticles(res.data);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await kbService.getCategories();
        setCategories(res.data);
      } catch (error) { console.error(error); }
    };
    fetchCategories();
    fetchArticles();
  }, [fetchArticles]);

  const handleOpenModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        category: article.category._id,
        title: article.title,
        youtubeUrl: article.youtubeUrl || '',
        content: article.content
      });
    } else {
      setEditingArticle(null);
      setFormData({ category: '', title: '', youtubeUrl: '', content: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.content) {
      return alert('Category, Title, and Content are required.');
    }
    try {
      if (editingArticle) {
        await kbService.updateArticle(editingArticle._id, formData);
      } else {
        await kbService.addArticle(formData);
      }
      setModalOpen(false);
      fetchArticles();
    } catch (error) {
      alert('Failed to save article.');
    }
  };
  
  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure?')) {
        await kbService.deleteArticle(articleId);
        fetchArticles();
    }
  };

  const quillModules = { toolbar: [
      [{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}], [{'align': []}],
      ['link', 'image'], ['clean']
  ]};

  return (
    <Container>
      <Toolbar>
        <Filters>
          <Select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </Select>
          <Input placeholder="Search by title..." onChange={e => setFilters({...filters, search: e.target.value})} />
        </Filters>
        <Button onClick={() => handleOpenModal()}><FiPlus/> Add Article</Button>
      </Toolbar>

      {isLoading ? <p>Loading...</p> : (
        <ArticleGrid>
          {articles.map(article => (
            <ArticleCard key={article._id}>
              <h3>{article.title}</h3>
              <p>Category: {article.category.name}</p>
              <CardFooter>
                <Button 
                  onClick={() => navigate(`/knowledgebase/article/${article._id}`)}
                  style={{backgroundColor: '#03d9c5', color: '#000'}}
                >
                  <FiEye/> View
                </Button>
                <Button onClick={() => handleOpenModal(article)}><FiEdit/> Edit</Button>
                <Button onClick={() => handleDelete(article._id)} style={{backgroundColor: '#555'}}><FiTrash2/> Delete</Button>
              </CardFooter>
            </ArticleCard>
          ))}
        </ArticleGrid>
      )}

      {modalOpen && (
        <ModalBackdrop>
          <ModalContent>
            <h2>{editingArticle ? 'Edit' : 'Add'} Article</h2>
            <FormGroup>
              <label>Category</label>
              <Select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Select a Category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <label>Article Title</label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </FormGroup>
            <FormGroup>
              <label>YouTube URL (Optional)</label>
              <Input value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} />
            </FormGroup>
            <FormGroup>
              <label>Content</label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={value => setFormData({...formData, content: value})}
                modules={quillModules}
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </FormGroup>
            <ModalButtonGroup>
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={() => setModalOpen(false)} style={{backgroundColor: '#555'}}>Close</Button>
            </ModalButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default ArticleManager;
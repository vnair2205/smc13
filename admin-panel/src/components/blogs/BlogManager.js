// admin-panel/src/components/blogs/BlogManager.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import * as blogService from '../../services/blogService';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

// --- STYLED COMPONENTS ---
const Toolbar = styled.div` display: flex; gap: 1rem; margin-bottom: 2rem; `;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, primary }) => (primary ? theme.colors.primary : '#333')};
  color: ${({ primary }) => (primary ? '#000' : 'white')};
  border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;
  font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem;
  &:hover { opacity: 0.9; }
`;
const Select = styled.select` padding: 0.75rem; background-color: #1e1e2d; border: 1px solid #444; color: white; border-radius: 6px; `;
const Input = styled.input` padding: 0.75rem; background-color: #1e1e2d; border: 1px solid #444; color: white; border-radius: 6px; `;
const BlogGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; `;
const BlogCard = styled.div`
  background: #1e1e2d; border-radius: 8px; overflow: hidden;
  display: flex; flex-direction: column;
`;
const CardThumbnail = styled.img` width: 100%; height: 200px; object-fit: cover; `;
const CardContent = styled.div` padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; `;
const CardDate = styled.p` font-size: 0.9rem; color: #a0a0a0; margin: 0 0 0.5rem; `;
const CardTitle = styled.h3` font-size: 1.2rem; margin: 0; flex-grow: 1; `;
const CardActions = styled.div` display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; `;
// Modal styles...
const ModalBackdrop = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; `;
const ModalContent = styled.div` background: #2a2a3e; padding: 2rem; border-radius: 8px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; `;
const FormGroup = styled.div` margin-bottom: 1rem; label { display: block; margin-bottom: 0.5rem; }`;

const BlogManager = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', search: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);

    // Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [blogDate, setBlogDate] = useState(new Date().toISOString().split('T')[0]);
    const [content, setContent] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await blogService.getBlogs(filters);
            setBlogs(res.data);
        } catch (error) { console.error("Failed to fetch blogs", error); } 
        finally { setIsLoading(false); }
    }, [filters]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await blogService.getCategories();
                setCategories(res.data);
            } catch (error) { console.error("Failed to fetch categories", error); }
        };
        fetchCategories();
    }, []);

    const resetForm = () => {
        setTitle(''); setCategory(''); setYoutubeUrl(''); setContent('');
        setBlogDate(new Date().toISOString().split('T')[0]);
        setThumbnail(null); setThumbnailPreview(''); setEditingBlog(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (blog) => {
        setEditingBlog(blog);
        setTitle(blog.title);
        setCategory(blog.category._id);
        setYoutubeUrl(blog.youtubeUrl || '');
        setContent(blog.content);
        setBlogDate(new Date(blog.blogDate).toISOString().split('T')[0]);
        setThumbnailPreview(`http://localhost:5000/${blog.thumbnail}`);
        setThumbnail(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('youtubeUrl', youtubeUrl);
        formData.append('blogDate', blogDate);
        formData.append('content', content);
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }

        try {
            if (editingBlog) {
                await blogService.updateBlog(editingBlog._id, formData);
            } else {
                await blogService.addBlog(formData);
            }
            fetchBlogs();
            setIsModalOpen(false);
        } catch (error) {
            alert('Failed to save blog.');
        }
    };
    
    const handleDelete = async (blogId) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            try {
                await blogService.deleteBlog(blogId);
                fetchBlogs();
            } catch (error) {
                alert('Failed to delete blog.');
            }
        }
    };

    return (
        <div>
            <Toolbar>
                <Button primary onClick={openAddModal}><FiPlus /> Add Blog</Button>
                <Select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </Select>
                <Input type="text" placeholder="Search by title..." onChange={e => setFilters({...filters, search: e.target.value})} />
            </Toolbar>

            {isLoading ? <p>Loading blogs...</p> : (
                <BlogGrid>
                    {blogs.map(blog => (
                        <BlogCard key={blog._id}>
                            <CardThumbnail src={`http://localhost:5000/${blog.thumbnail}`} alt={blog.title} />
                            <CardContent>
                                <CardDate>{format(new Date(blog.blogDate), 'MMM d, yyyy')}</CardDate>
                                <CardTitle>{blog.title}</CardTitle>
                                <CardActions>
                                    <Button onClick={() => navigate(`/blogs/article/${blog._id}`)}>Read More</Button>
                                    <div>
                                        <FiEdit onClick={() => openEditModal(blog)} style={{cursor: 'pointer', marginRight: '1rem'}}/>
                                        <FiTrash2 onClick={() => handleDelete(blog._id)} style={{cursor: 'pointer', color: '#ff5b5b'}}/>
                                    </div>
                                </CardActions>
                            </CardContent>
                        </BlogCard>
                    ))}
                </BlogGrid>
            )}

            {isModalOpen && (
                <ModalBackdrop>
                    <ModalContent>
                        <h2>{editingBlog ? 'Edit Blog' : 'Add New Blog'}</h2>
                        <FormGroup><label>Title</label><Input type="text" value={title} onChange={e => setTitle(e.target.value)} /></FormGroup>
                        <FormGroup><label>Category</label>
                            <Select value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </Select>
                        </FormGroup>
                        <FormGroup><label>YouTube URL (Optional)</label><Input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} /></FormGroup>
                        <FormGroup><label>Blog Date</label><Input type="date" value={blogDate} onChange={e => setBlogDate(e.target.value)} /></FormGroup>
                        <FormGroup><label>Thumbnail (3:2 Aspect Ratio)</label><Input type="file" onChange={handleFileChange} accept="image/*" />
                            {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" style={{maxWidth: '200px', marginTop: '1rem'}}/>}
                        </FormGroup>
                        <FormGroup><label>Content</label><ReactQuill theme="snow" value={content} onChange={setContent} /></FormGroup>
                        <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                            <Button primary onClick={handleSave}>Save</Button>
                        </div>
                    </ModalContent>
                </ModalBackdrop>
            )}
        </div>
    );
};

export default BlogManager;
// admin-panel/src/pages/ViewBlogPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as blogService from '../services/blogService';
import Preloader from '../components/common/Preloader';
import { format } from 'date-fns';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2a2a3e;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const MetaInfo = styled.p`
  font-size: 1rem;
  color: #a0a0a0;
`;

const Thumbnail = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Content = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.8;
  font-size: 1.1rem;

  h1, h2, h3 { color: ${({ theme }) => theme.colors.primary}; }
  a { color: ${({ theme }) => theme.colors.primary}; }
  pre { background-color: #2a2a3e; padding: 1rem; border-radius: 8px; }
`;

const ViewBlogPage = () => {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const { data } = await blogService.getBlogById(blogId);
                setBlog(data);
            } catch (error) {
                console.error("Failed to fetch blog", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlog();
    }, [blogId]);

    if (isLoading) return <Preloader />;
    if (!blog) return <PageContainer><p>Blog not found.</p></PageContainer>;

    return (
        <PageContainer>
            <Link to="/blogs">← Back to Blogs</Link>
            <Header>
                <Title>{blog.title}</Title>
                <MetaInfo>
                    Posted on {format(new Date(blog.blogDate), 'MMMM d, yyyy')} in {blog.category?.name || 'Uncategorized'}
                </MetaInfo>
            </Header>
            <Thumbnail src={`http://localhost:5000/${blog.thumbnail}`} alt={blog.title} />
            <Content dangerouslySetInnerHTML={{ __html: blog.content }} />
        </PageContainer>
    );
};

export default ViewBlogPage;
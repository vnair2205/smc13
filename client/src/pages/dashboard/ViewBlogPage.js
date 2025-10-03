// client/src/pages/dashboard/ViewBlogPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as blogService from '../../services/blogService';
import Preloader from '../../components/common/Preloader';
import { format } from 'date-fns';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text};
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
  line-height: 1.8;
  font-size: 1.1rem;

  h1, h2, h3 { color: ${({ theme }) => theme.colors.primary}; }
  a { color: ${({ theme }) => theme.colors.primary}; text-decoration: underline; }
  pre { background-color: #2a2a3e; padding: 1rem; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; }
  img { max-width: 100%; height: auto; border-radius: 8px; }
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  margin-bottom: 2rem;
  border-radius: 8px;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
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

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = '';
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                videoId = match[1];
                break;
            }
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    if (isLoading) return <Preloader />;
    if (!blog) return <PageContainer><p>Blog not found.</p></PageContainer>;

    const embedUrl = getYouTubeEmbedUrl(blog.youtubeUrl);

    return (
        <PageContainer>
            <Link to="/blogs">← Back to Blogs & Tips</Link>
            <Header>
                <Title>{blog.title}</Title>
                <MetaInfo>
                    Posted on {format(new Date(blog.blogDate), 'MMMM d, yyyy')} in {blog.category?.name || 'Uncategorized'}
                </MetaInfo>
            </Header>

            {embedUrl ? (
                <VideoContainer>
                    <iframe
                        src={embedUrl}
                        title={blog.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </VideoContainer>
            ) : (
                <Thumbnail src={`http://localhost:5000/${blog.thumbnail}`} alt={blog.title} />
            )}

            <Content dangerouslySetInnerHTML={{ __html: blog.content }} />
        </PageContainer>
    );
};

export default ViewBlogPage;
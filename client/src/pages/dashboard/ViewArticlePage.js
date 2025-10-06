// client/src/pages/dashboard/ViewArticlePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as kbService from '../../services/knowledgebaseService';
import Preloader from '../../components/common/Preloader';

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

const Category = styled.p`
  font-size: 1.1rem;
  color: #a0a0a0;
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%;
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

const Content = styled.div`
  line-height: 1.7;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  img { max-width: 100%; height: auto; border-radius: 8px; }
`;

const BackButton = styled.button`
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

const ViewArticlePage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await kbService.getArticleById(articleId);
        setArticle(res.data);
      } catch (error) {
        console.error("Failed to fetch article", error);
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = '';
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?youtu.be\/([a-zA-Z0-9_-]{11})/,
        /seekmycourse.*\/0([a-zA-Z0-9_-]{11})/
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
  
  // --- THIS IS THE FIX ---
  // We add guards for both loading and the article object itself.
  if (isLoading) {
    return <Preloader />;
  }

  if (!article) {
    return <PageContainer><p>Article not found.</p></PageContainer>;
  }
  // --- END OF FIX ---

  // This line is now safe to run because of the guards above
  const embedUrl = getYouTubeEmbedUrl(article.youtubeUrl);

  return (
    <PageContainer>
      <Header>
        <Title>{article.title}</Title>
        <Category>Category: {article.category?.name || 'Uncategorized'}</Category>
      </Header>

      {embedUrl && (
        <VideoContainer>
          <iframe
            src={embedUrl}
            title={article.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </VideoContainer>
      )}

      <Content dangerouslySetInnerHTML={{ __html: article.content }} />
      
      <BackButton onClick={() => navigate('/knowledge-base')}>
        Back to Articles
      </BackButton>
    </PageContainer>
  );
};

export default ViewArticlePage;
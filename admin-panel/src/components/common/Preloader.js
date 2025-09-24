// admin-panel/src/components/common/Preloader.js
import React from 'react';
import styled from 'styled-components';
import preloaderGif from '../../assets/preloader.gif';

const PreloaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Preloader = () => {
  return (
    <PreloaderContainer>
      <img src={preloaderGif} alt="Loading..." />
    </PreloaderContainer>
  );
};

export default Preloader;
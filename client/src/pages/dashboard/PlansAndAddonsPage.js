// client/src/pages/dashboard/PlansAndAddonsPage.js
import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
    padding: 2rem;
`;

const Header = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
`;

const PlansAndAddonsPage = () => {
    return (
        <PageWrapper>
            <Header>Plans & Addons</Header>
            <p>This page is under construction. You can upgrade your plan or purchase add-ons here in the future.</p>
        </PageWrapper>
    );
};

export default PlansAndAddonsPage;
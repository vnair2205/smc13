import React from 'react';
import PublicLayout from './PublicLayout';
import DashboardLayout from './DashboardLayout';

const KnowledgeBaseLayout = () => {
    // Check for the user's token in local storage
    const token = localStorage.getItem('token');

    // If a token exists, the user is logged in, so show the DashboardLayout.
    // Otherwise, show the PublicLayout for non-registered users.
    // Both layouts will render the nested page (e.g., KnowledgebasePage) via their <Outlet /> component.
    return token ? <DashboardLayout /> : <PublicLayout />;
};

export default KnowledgeBaseLayout;
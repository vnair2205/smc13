import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyles';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

// --- Import the new pages ---
import CategoryManagementPage from './pages/CategoryManagementPage';
import AdminGenerateCoursePage from './pages/AdminGenerateCoursePage';
import GeneratedCoursesPage from './pages/GeneratedCoursesPage';
import PreGenCourseViewPage from './pages/PreGenCourseViewPage';

import AdminLessonContentPage from './pages/AdminLessonContentPage';
import KnowledgebasePage from './pages/KnowledgebasePage';
import ViewArticlePage from './pages/ViewArticlePage';


import SupportTicketsPage from './pages/SupportTicketsPage';
import TeamPage from './pages/TeamPage';
import AdminViewTicketPage from './pages/AdminViewTicketPage'; // Add this import at the top

import BlogsPage from './pages/BlogsPage';
import ViewBlogPage from './pages/ViewBlogPage';
import TermsManagementPage from './pages/TermsManagementPage';

import SubscriptionPlansPage from './pages/SubscriptionPlansPage';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/" element={<AdminProtectedRoute><DashboardPage /></AdminProtectedRoute>} />
          <Route path="/user-management" element={<AdminProtectedRoute><UserManagementPage /></AdminProtectedRoute>} />
          <Route path="/support-tickets/:ticketId" element={<AdminViewTicketPage />} />
          
          {/* --- Add the new routes for the sub-menus --- */}
          <Route path="/category-management" element={<AdminProtectedRoute><CategoryManagementPage /></AdminProtectedRoute>} />
          <Route path="/generate-course" element={<AdminProtectedRoute><AdminGenerateCoursePage /></AdminProtectedRoute>} />
          <Route path="/generated-courses" element={<AdminProtectedRoute><GeneratedCoursesPage /></AdminProtectedRoute>} />
           <Route path="/pre-generated-courses/:id" element={<AdminProtectedRoute><PreGenCourseViewPage /></AdminProtectedRoute>} />
           <Route path="/knowledgebase" element={<AdminProtectedRoute><KnowledgebasePage /></AdminProtectedRoute>} />
           <Route path="/support-tickets" element={<AdminProtectedRoute><SupportTicketsPage /></AdminProtectedRoute>} />
           <Route path="/knowledgebase/article/:articleId" element={<AdminProtectedRoute><ViewArticlePage /></AdminProtectedRoute>} />
           <Route path="/team" element={<AdminProtectedRoute><TeamPage /></AdminProtectedRoute>} />
           {/* --- ADD THESE NEW ROUTES --- */}
           <Route path="/blogs" element={<AdminProtectedRoute><BlogsPage /></AdminProtectedRoute>} />
           <Route path="/blogs/article/:blogId" element={<AdminProtectedRoute><ViewBlogPage /></AdminProtectedRoute>} />
            <Route path="/terms" element={<AdminProtectedRoute><TermsManagementPage /></AdminProtectedRoute>} />
            <Route path="/subscription-plans" element={<AdminProtectedRoute><SubscriptionPlansPage /></AdminProtectedRoute>} />
           {/* --- END OF NEW ROUTES --- */}
            <Route 
            path="/admin/course-player/:id/lesson/:subtopicId/:lessonId" 
            element={<AdminProtectedRoute><AdminLessonContentPage /></AdminProtectedRoute>} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
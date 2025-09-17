// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Auth Pages
import Login from './pages/Login';
import AcceptInvite from './pages/AcceptInvite';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NoAccess from './pages/NoAccess';
import NotFound from './pages/NotFound';

// Client Pages
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/Dashboard';
import ClientProjects from './pages/client/Projects';
// Remove ProjectDetail import - it doesn't exist yet
import ClientInvoices from './pages/client/Invoices';
import ClientSupport from './pages/client/Support';
import ClientProfile from './pages/client/Profile';
import ClientSetupProfile from './pages/client/ClientSetupProfile';

// Utils
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';

const Routes = ({ session }) => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/no-access" element={<NoAccess />} />
          
          {/* Client Setup */}
          <Route path="/setup-profile" element={
            <ProtectedRoute session={session} requiredRoles={['standard']}>
              <ClientSetupProfile />
            </ProtectedRoute>
          } />
          
          {/* Client Portal Routes */}
          <Route path="/" element={
            <ProtectedRoute session={session} requiredRoles={['standard']}>
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboard />} />
            <Route path="projects" element={<ClientProjects />} />
            {/* Remove ProjectDetail route for now */}
            <Route path="invoices" element={<ClientInvoices />} />
            <Route path="support" element={<ClientSupport />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
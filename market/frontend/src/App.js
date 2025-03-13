import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

// Composants de mise en page
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Routes d'administration
import AdminRoutes from './components/admin/AdminRoutes';

// Contexte d'authentification
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <AuthProvider>
      <ThemeProvider>
        {isAdminRoute ? (
          // Routes d'administration
          <AdminRoutes />
        ) : (
          // Routes publiques
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Ces routes seront implémentées ultérieurement */}
                {/* <Route path="/apps" element={<AppsPage />} />
                <Route path="/apps/:appId" element={<AppDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} /> */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        )}
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

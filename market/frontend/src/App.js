import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Composants de mise en page
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import AppsPage from './pages/AppsPage';
import AppDetailPage from './pages/AppDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Contexte d'authentification
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/apps/:appId" element={<AppDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

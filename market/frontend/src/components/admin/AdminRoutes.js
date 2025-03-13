import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout d'administration
import AdminLayout from './AdminLayout';

// Pages d'administration
import AdminDashboardPage from '../../pages/AdminDashboardPage';
import AdminAppsPage from '../../pages/AdminAppsPage';
import AdminAppFormPage from '../../pages/AdminAppFormPage';
import AdminCategoriesPage from '../../pages/AdminCategoriesPage';
import AdminUsersPage from '../../pages/AdminUsersPage';
import NotFoundPage from '../../pages/NotFoundPage';

// Contexte d'authentification
import { useAuth } from '../../contexts/AuthContext';

/**
 * Composant pour les routes d'administration
 * Vérifie si l'utilisateur est authentifié et a le rôle d'administrateur
 */
const AdminRoutes = () => {
  // Dans un environnement réel, nous utiliserions le contexte d'authentification
  // pour vérifier si l'utilisateur est authentifié et a le rôle d'administrateur
  // const { isAuthenticated, user } = useAuth();
  // const isAdmin = isAuthenticated && user?.role === 'admin';
  
  // Pour le moment, nous simulons un utilisateur administrateur
  const isAdmin = true;
  
  // Si l'utilisateur n'est pas administrateur, rediriger vers la page d'accueil
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <AdminLayout>
      <Routes>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/apps" element={<AdminAppsPage />} />
        <Route path="/admin/apps/new" element={<AdminAppFormPage />} />
        <Route path="/admin/apps/:id/edit" element={<AdminAppFormPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;

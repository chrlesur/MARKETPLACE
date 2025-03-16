import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from '../services/auth.service';
import { logError } from '../services/api';

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifier la validité du token et récupérer les informations de l'utilisateur
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Récupérer les données de l'utilisateur
  const fetchUserData = async (token) => {
    try {
      // Utiliser le service d'authentification pour récupérer les données de l'utilisateur
      const user = await getCurrentUser();
      
      if (user) {
        setCurrentUser(user);
      } else {
        // Si aucun utilisateur n'est retourné, supprimer le token
        localStorage.removeItem('token');
        setError('Session expirée. Veuillez vous reconnecter.');
      }
    } catch (err) {
      logError('Erreur lors de la récupération des données utilisateur:', err);
      localStorage.removeItem('token');
      setError(err.message || 'Session expirée. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser le service d'authentification pour se connecter
      const user = await authLogin(email, password);
      
      // Mettre à jour l'état de l'utilisateur
      setCurrentUser(user);
      
      // Ne pas rediriger ici, laisser LoginPage gérer la redirection
      console.log('Authentification réussie dans AuthContext, utilisateur:', user);
      
      return true;
    } catch (err) {
      logError('Erreur de connexion:', err);
      setError(err.message || 'Erreur de connexion. Veuillez réessayer.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser le service d'authentification pour s'inscrire
      const user = await authRegister(name, email, password);
      
      // Mettre à jour l'état de l'utilisateur
      setCurrentUser(user);
      
      // Rediriger vers la page d'accueil
      navigate('/');
      
      return true;
    } catch (err) {
      logError('Erreur d\'inscription:', err);
      setError(err.message || 'Erreur d\'inscription. Veuillez réessayer.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Utiliser le service d'authentification pour se déconnecter
      await authLogout();
      
      // Mettre à jour l'état de l'utilisateur
      setCurrentUser(null);
      
      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (err) {
      logError('Erreur lors de la déconnexion:', err);
    }
  };

  // Fonction pour vérifier si l'utilisateur est connecté
  const isLoggedIn = () => {
    return currentUser !== null;
  };

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isLoggedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

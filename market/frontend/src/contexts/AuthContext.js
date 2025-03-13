import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      // Configuration de l'en-tête avec le token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Appel à l'API pour récupérer les données de l'utilisateur
      // Dans une implémentation réelle, remplacez l'URL par celle de votre API
      // const response = await axios.get('http://localhost:3001/api/users/me', config);
      
      // Pour le moment, simulons une réponse
      const mockUser = {
        id: '1',
        name: 'Utilisateur Test',
        email: 'test@example.com',
        role: 'user'
      };
      
      setCurrentUser(mockUser);
    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err);
      localStorage.removeItem('token');
      setError('Session expirée. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Dans une implémentation réelle, remplacez l'URL par celle de votre API
      // const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      // const { token, user } = response.data;
      
      // Pour le moment, simulons une réponse
      const token = 'fake-jwt-token';
      const user = {
        id: '1',
        name: 'Utilisateur Test',
        email: email,
        role: 'user'
      };
      
      // Stocker le token dans le localStorage
      localStorage.setItem('token', token);
      
      // Mettre à jour l'état de l'utilisateur
      setCurrentUser(user);
      
      // Rediriger vers la page d'accueil
      navigate('/');
      
      return true;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.response?.data?.message || 'Erreur de connexion. Veuillez réessayer.');
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
      
      // Dans une implémentation réelle, remplacez l'URL par celle de votre API
      // const response = await axios.post('http://localhost:3001/api/auth/register', { name, email, password });
      // const { token, user } = response.data;
      
      // Pour le moment, simulons une réponse
      const token = 'fake-jwt-token';
      const user = {
        id: '1',
        name: name,
        email: email,
        role: 'user'
      };
      
      // Stocker le token dans le localStorage
      localStorage.setItem('token', token);
      
      // Mettre à jour l'état de l'utilisateur
      setCurrentUser(user);
      
      // Rediriger vers la page d'accueil
      navigate('/');
      
      return true;
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(err.response?.data?.message || 'Erreur d\'inscription. Veuillez réessayer.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/');
  };

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

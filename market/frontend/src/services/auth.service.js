/**
 * Service d'authentification
 * 
 * Ce service gère les opérations liées à l'authentification des utilisateurs :
 * connexion, inscription, récupération des informations utilisateur, etc.
 * 
 * @module services/auth
 * @author Marketplace Team
 * @version 1.0.0
 */

import { get, post, logDebug, logError } from './api';

// ========================================================================
// Constantes
// ========================================================================

/**
 * Clé utilisée pour stocker le token dans le localStorage
 * @constant {string}
 */
const TOKEN_KEY = 'token';

/**
 * Clé utilisée pour stocker les informations utilisateur dans le localStorage
 * @constant {string}
 */
const USER_KEY = 'user';

// ========================================================================
// Fonctions utilitaires
// ========================================================================

/**
 * Stocke le token d'authentification dans le localStorage
 * @param {string} token - Token JWT à stocker
 */
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    logDebug('Token stocké dans le localStorage');
  } else {
    logError('Tentative de stockage d\'un token null ou undefined');
  }
};

/**
 * Récupère le token d'authentification depuis le localStorage
 * @returns {string|null} Token JWT ou null si non trouvé
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Supprime le token d'authentification du localStorage
 */
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  logDebug('Token supprimé du localStorage');
};

/**
 * Stocke les informations utilisateur dans le localStorage
 * @param {Object} user - Informations utilisateur à stocker
 */
const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    logDebug('Informations utilisateur stockées dans le localStorage');
  } else {
    logError('Tentative de stockage d\'un utilisateur null ou undefined');
  }
};

/**
 * Récupère les informations utilisateur depuis le localStorage
 * @returns {Object|null} Informations utilisateur ou null si non trouvées
 */
const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      logError('Erreur lors du parsing des informations utilisateur', error);
      return null;
    }
  }
  return null;
};

/**
 * Supprime les informations utilisateur du localStorage
 */
const removeUser = () => {
  localStorage.removeItem(USER_KEY);
  logDebug('Informations utilisateur supprimées du localStorage');
};

// ========================================================================
// Fonctions d'authentification
// ========================================================================

/**
 * Connecte un utilisateur avec son email et son mot de passe
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} Informations utilisateur
 * @throws {Error} En cas d'échec de la connexion
 */
const login = async (email, password) => {
  try {
    logDebug('Tentative de connexion', { email });
    
    // Appel à l'API pour se connecter
    const data = await post('/auth/login', { email, password });
    
    // Extraire le token et les informations utilisateur
    const { token, user } = data;
    
    // Stocker le token et les informations utilisateur
    setToken(token);
    setUser(user);
    
    logDebug('Connexion réussie', { user });
    
    return user;
  } catch (error) {
    logError('Erreur lors de la connexion', error);
    throw error;
  }
};

/**
 * Inscrit un nouvel utilisateur
 * @param {string} name - Nom de l'utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @returns {Promise<Object>} Informations utilisateur
 * @throws {Error} En cas d'échec de l'inscription
 */
const register = async (name, email, password) => {
  try {
    logDebug('Tentative d\'inscription', { name, email });
    
    // Appel à l'API pour s'inscrire
    const data = await post('/auth/register', { name, email, password });
    
    // Extraire le token et les informations utilisateur
    const { token, user } = data;
    
    // Stocker le token et les informations utilisateur
    setToken(token);
    setUser(user);
    
    logDebug('Inscription réussie', { user });
    
    return user;
  } catch (error) {
    logError('Erreur lors de l\'inscription', error);
    throw error;
  }
};

/**
 * Déconnecte l'utilisateur courant
 * @returns {Promise<void>}
 */
const logout = async () => {
  try {
    // Appel à l'API pour se déconnecter (côté serveur)
    await post('/auth/logout');
  } catch (error) {
    logError('Erreur lors de la déconnexion', error);
  } finally {
    // Supprimer le token et les informations utilisateur (côté client)
    removeToken();
    removeUser();
    logDebug('Déconnexion réussie');
  }
};

/**
 * Récupère les informations de l'utilisateur connecté
 * @returns {Promise<Object>} Informations utilisateur
 * @throws {Error} En cas d'échec de la récupération
 */
const getCurrentUser = async () => {
  try {
    // Vérifier si un token existe
    if (!getToken()) {
      logDebug('Aucun token trouvé, impossible de récupérer l\'utilisateur');
      return null;
    }
    
    // Appel à l'API pour récupérer les informations utilisateur
    const user = await get('/auth/me');
    
    // Mettre à jour les informations utilisateur stockées
    setUser(user);
    
    logDebug('Informations utilisateur récupérées', { user });
    
    return user;
  } catch (error) {
    logError('Erreur lors de la récupération des informations utilisateur', error);
    
    // En cas d'erreur d'authentification, supprimer le token et les informations utilisateur
    if (error.status === 401) {
      removeToken();
      removeUser();
    }
    
    throw error;
  }
};

/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean} Vrai si l'utilisateur est connecté
 */
const isLoggedIn = () => {
  return getToken() !== null;
};

/**
 * Vérifie si l'utilisateur est un administrateur
 * @returns {boolean} Vrai si l'utilisateur est un administrateur
 */
const isAdmin = () => {
  const user = getUser();
  return user !== null && user.role === 'admin';
};

// ========================================================================
// Exportations
// ========================================================================

export {
  login,
  register,
  logout,
  getCurrentUser,
  isLoggedIn,
  isAdmin,
  getToken,
  getUser
};

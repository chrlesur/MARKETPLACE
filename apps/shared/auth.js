/**
 * Module d'authentification partagée pour les applications tierces
 * Ce module permet aux applications tierces d'utiliser le système d'authentification de la marketplace
 * 
 * @module apps/shared/auth
 * @author Marketplace Team
 * @version 1.0.0
 */

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean} Vrai si l'utilisateur est authentifié
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Vérifier si le token est expiré
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiration = payload.exp * 1000; // Convertir en millisecondes
    
    if (Date.now() >= expiration) {
      localStorage.removeItem('token');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Redirige vers la page de connexion de la marketplace
 * @param {string} [redirectPath=window.location.pathname] - Chemin de redirection après connexion
 */
const redirectToLogin = (redirectPath = window.location.pathname) => {
  window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
};

/**
 * Récupère les informations de l'utilisateur à partir du token
 * @returns {Object|null} Informations de l'utilisateur ou null si non authentifié
 */
const getUserInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * @param {string} role - Rôle à vérifier ('admin', 'user', etc.)
 * @returns {boolean} Vrai si l'utilisateur a le rôle spécifié
 */
const hasRole = (role) => {
  const user = getUserInfo();
  if (!user) return false;
  
  return user.role === role;
};

/**
 * Déconnecte l'utilisateur et redirige vers la page de connexion
 */
const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

/**
 * Ajoute un en-tête d'autorisation à une requête
 * @param {Object} headers - En-têtes de la requête
 * @returns {Object} En-têtes avec l'autorisation ajoutée
 */
const addAuthHeader = (headers = {}) => {
  const token = localStorage.getItem('token');
  if (!token) return headers;
  
  return {
    ...headers,
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Initialise l'authentification pour une application tierce
 * Cette fonction doit être appelée au chargement de l'application
 * @param {Object} options - Options d'initialisation
 * @param {boolean} [options.requireAuth=true] - Si vrai, redirige vers la page de connexion si l'utilisateur n'est pas authentifié
 * @param {string} [options.requiredRole=null] - Si spécifié, vérifie que l'utilisateur a le rôle requis
 * @param {Function} [options.onSuccess=null] - Fonction à appeler si l'authentification réussit
 * @param {Function} [options.onFailure=null] - Fonction à appeler si l'authentification échoue
 * @returns {Object|null} Informations de l'utilisateur ou null si non authentifié
 */
const initAuth = (options = {}) => {
  const {
    requireAuth = true,
    requiredRole = null,
    onSuccess = null,
    onFailure = null
  } = options;
  
  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated()) {
    if (requireAuth) {
      if (onFailure) onFailure('Non authentifié');
      redirectToLogin();
    }
    return null;
  }
  
  // Récupérer les informations de l'utilisateur
  const user = getUserInfo();
  
  // Vérifier le rôle si nécessaire
  if (requiredRole && user.role !== requiredRole) {
    if (requireAuth) {
      if (onFailure) onFailure('Rôle insuffisant');
      redirectToLogin();
    }
    return null;
  }
  
  // Appeler la fonction de succès si elle existe
  if (onSuccess) onSuccess(user);
  
  return user;
};

export {
  isAuthenticated,
  redirectToLogin,
  getUserInfo,
  hasRole,
  logout,
  addAuthHeader,
  initAuth
};

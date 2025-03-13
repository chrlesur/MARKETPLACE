/**
 * Service API de base
 * 
 * Ce service fournit une instance Axios configurée pour communiquer avec le backend.
 * Il gère l'authentification via JWT, les erreurs et les timeouts.
 * 
 * @module services/api
 * @author Marketplace Team
 * @version 1.0.0
 */

import axios from 'axios';

// ========================================================================
// Configuration
// ========================================================================

/**
 * Indique si le mode débogage est activé (automatiquement en développement)
 * @constant {boolean}
 */
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * URL de base de l'API en fonction de l'environnement
 * @constant {string}
 */
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

/**
 * Timeout par défaut pour les requêtes (en millisecondes)
 * @constant {number}
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Codes d'erreur HTTP qui nécessitent une redirection vers la page de connexion
 * @constant {Array<number>}
 */
const AUTH_ERROR_CODES = [401];

/**
 * Codes d'erreur HTTP qui nécessitent un message d'erreur spécifique
 * @constant {Object}
 */
const ERROR_MESSAGES = {
  401: 'Session expirée. Veuillez vous reconnecter.',
  403: 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.',
  404: 'La ressource demandée n\'existe pas.',
  500: 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.',
  503: 'Le service est temporairement indisponible. Veuillez réessayer plus tard.'
};

// ========================================================================
// Fonctions de débogage
// ========================================================================

/**
 * Affiche un message de débogage dans la console (uniquement en mode développement)
 * @param {string} message - Message à afficher
 * @param {*} [data] - Données supplémentaires à afficher
 */
const logDebug = (message, data) => {
  if (DEBUG) {
    console.log(`[API] ${message}`, data !== undefined ? data : '');
  }
};

/**
 * Affiche un message d'erreur dans la console (uniquement en mode développement)
 * @param {string} message - Message d'erreur à afficher
 * @param {*} [error] - Objet d'erreur à afficher
 */
const logError = (message, error) => {
  if (DEBUG) {
    console.error(`[API ERROR] ${message}`, error !== undefined ? error : '');
  }
};

// ========================================================================
// Création de l'instance Axios
// ========================================================================

/**
 * Instance Axios configurée pour communiquer avec le backend
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================================================
// Intercepteurs
// ========================================================================

/**
 * Intercepteur pour ajouter le token d'authentification aux requêtes
 */
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('token');
    
    // Si un token existe, l'ajouter à l'en-tête Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logDebug('Token ajouté à la requête', { url: config.url });
    } else {
      logDebug('Aucun token disponible pour la requête', { url: config.url });
    }
    
    // Journaliser la requête en mode débogage
    logDebug('Requête envoyée', { 
      method: config.method?.toUpperCase(), 
      url: config.url, 
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    // Journaliser l'erreur en mode débogage
    logError('Erreur lors de la préparation de la requête', error);
    
    return Promise.reject(error);
  }
);

/**
 * Intercepteur pour gérer les réponses et les erreurs
 */
api.interceptors.response.use(
  (response) => {
    // Journaliser la réponse en mode débogage
    logDebug('Réponse reçue', { 
      status: response.status, 
      url: response.config.url, 
      data: response.data 
    });
    
    return response;
  },
  (error) => {
    // Extraire les informations d'erreur
    const { response, request, message, config } = error;
    
    // Préparer un objet d'erreur formaté
    const formattedError = {
      message: 'Une erreur est survenue lors de la communication avec le serveur.',
      originalError: error,
      status: response?.status,
      data: response?.data,
      url: config?.url,
      method: config?.method?.toUpperCase()
    };
    
    // Journaliser l'erreur en mode débogage
    logError('Erreur de réponse', formattedError);
    
    // Gérer les différents types d'erreurs
    if (response) {
      // Erreur avec réponse du serveur (4xx, 5xx)
      formattedError.message = ERROR_MESSAGES[response.status] || 
                              response.data?.message || 
                              formattedError.message;
      
      // Gérer les erreurs d'authentification
      if (AUTH_ERROR_CODES.includes(response.status)) {
        // Supprimer le token expiré ou invalide
        localStorage.removeItem('token');
        
        // Rediriger vers la page de connexion
        if (window.location.pathname !== '/login') {
          logDebug('Redirection vers la page de connexion (token invalide)');
          window.location.href = '/login';
        }
      }
    } else if (request) {
      // Erreur sans réponse du serveur (timeout, réseau, CORS)
      formattedError.message = 'Impossible de communiquer avec le serveur. Vérifiez votre connexion internet.';
      
      if (error.code === 'ECONNABORTED') {
        formattedError.message = 'La requête a pris trop de temps à s\'exécuter. Veuillez réessayer.';
      }
    } else {
      // Erreur lors de la configuration de la requête
      formattedError.message = message || formattedError.message;
    }
    
    // Retourner une promesse rejetée avec l'erreur formatée
    return Promise.reject(formattedError);
  }
);

// ========================================================================
// Méthodes utilitaires
// ========================================================================

/**
 * Effectue une requête GET
 * @param {string} url - URL de la requête (relative à l'URL de base)
 * @param {Object} [params={}] - Paramètres de la requête
 * @param {Object} [config={}] - Configuration supplémentaire pour Axios
 * @returns {Promise<any>} Données de la réponse
 */
const get = async (url, params = {}, config = {}) => {
  try {
    const response = await api.get(url, { params, ...config });
    return response.data;
  } catch (error) {
    logError(`Erreur lors de la requête GET ${url}`, error);
    throw error;
  }
};

/**
 * Effectue une requête POST
 * @param {string} url - URL de la requête (relative à l'URL de base)
 * @param {Object} [data={}] - Données à envoyer
 * @param {Object} [config={}] - Configuration supplémentaire pour Axios
 * @returns {Promise<any>} Données de la réponse
 */
const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    logError(`Erreur lors de la requête POST ${url}`, error);
    throw error;
  }
};

/**
 * Effectue une requête PUT
 * @param {string} url - URL de la requête (relative à l'URL de base)
 * @param {Object} [data={}] - Données à envoyer
 * @param {Object} [config={}] - Configuration supplémentaire pour Axios
 * @returns {Promise<any>} Données de la réponse
 */
const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    logError(`Erreur lors de la requête PUT ${url}`, error);
    throw error;
  }
};

/**
 * Effectue une requête DELETE
 * @param {string} url - URL de la requête (relative à l'URL de base)
 * @param {Object} [config={}] - Configuration supplémentaire pour Axios
 * @returns {Promise<any>} Données de la réponse
 */
const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    logError(`Erreur lors de la requête DELETE ${url}`, error);
    throw error;
  }
};

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean} Vrai si l'utilisateur est authentifié
 */
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

/**
 * Déconnecte l'utilisateur en supprimant le token
 */
const logout = () => {
  localStorage.removeItem('token');
  logDebug('Utilisateur déconnecté (token supprimé)');
};

// ========================================================================
// Exportations
// ========================================================================

// Exporter l'instance Axios par défaut
export default api;

// Exporter les méthodes utilitaires
export {
  get,
  post,
  put,
  del,
  isAuthenticated,
  logout,
  logDebug,
  logError
};

/**
 * Module d'intégration de NotePad avec la Marketplace
 * Ce module permet d'intégrer NotePad à la Marketplace en utilisant les modules partagés
 * 
 * @module apps/notepad/public/js/marketplace-integration
 * @author Marketplace Team
 * @version 1.0.0
 */

// Importer les modules partagés
import { initAuth, getUserInfo, addAuthHeader } from '/shared/auth.js';
import { showSuccess, showError, showInfo, showWarning } from '/shared/notifications.js';
import { createNavbar } from '/shared/navbar.js';

// Variables pour stocker les références aux fonctions exportées
let authInitialized = false;
let currentUser = null;

/**
 * Initialise l'authentification avec la Marketplace
 * @param {Object} options - Options d'initialisation
 * @returns {Promise<Object|null>} - Informations de l'utilisateur ou null si non authentifié
 */
const initializeAuth = async (options = {}) => {
  if (authInitialized) {
    return currentUser;
  }
  
  return new Promise((resolve) => {
    initAuth({
      ...options,
      onSuccess: (user) => {
        authInitialized = true;
        currentUser = user;
        
        // Créer la barre de navigation si demandé
        if (options.createNavbar !== false) {
          createMarketplaceNavbar(options.navbarOptions || {});
        }
        
        // Appeler le callback de succès original si fourni
        if (options.onSuccess) {
          options.onSuccess(user);
        }
        
        resolve(user);
      },
      onFailure: (reason) => {
        console.error(`Échec de l'authentification: ${reason}`);
        
        // Appeler le callback d'échec original si fourni
        if (options.onFailure) {
          options.onFailure(reason);
        }
        
        resolve(null);
      }
    });
  });
};

/**
 * Crée la barre de navigation de la Marketplace
 * @param {Object} options - Options de la barre de navigation
 * @returns {HTMLElement} - Élément de la barre de navigation
 */
const createMarketplaceNavbar = (options = {}) => {
  return createNavbar({
    appName: 'NotePad',
    ...options
  });
};

/**
 * Obtient les informations de l'utilisateur actuel
 * @returns {Object|null} - Informations de l'utilisateur ou null si non authentifié
 */
const getCurrentUser = () => {
  return currentUser || getUserInfo();
};

/**
 * Affiche une notification de succès
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes
 */
const showSuccessNotification = (message, duration) => {
  showSuccess(message, duration);
};

/**
 * Affiche une notification d'erreur
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes
 */
const showErrorNotification = (message, duration) => {
  showError(message, duration);
};

/**
 * Affiche une notification d'information
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes
 */
const showInfoNotification = (message, duration) => {
  showInfo(message, duration);
};

/**
 * Affiche une notification d'avertissement
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes
 */
const showWarningNotification = (message, duration) => {
  showWarning(message, duration);
};

// Exporter les fonctions
export {
  initializeAuth,
  createMarketplaceNavbar,
  getCurrentUser,
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
  showWarningNotification
};

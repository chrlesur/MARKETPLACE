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
  console.log('NotePad - Initialisation de l\'authentification avec options:', options);
  console.log('NotePad - État actuel du localStorage:', {
    token: !!localStorage.getItem('token'),
    tokenLength: localStorage.getItem('token') ? localStorage.getItem('token').length : 0
  });
  
  // Vérifier si l'authentification est déjà initialisée
  if (authInitialized && currentUser) {
    console.log('NotePad - Authentification déjà initialisée, utilisateur:', currentUser);
    
    // Appeler le callback de succès si fourni
    if (options.onSuccess) {
      try {
        options.onSuccess(currentUser);
      } catch (error) {
        console.error('NotePad - Erreur dans le callback onSuccess (déjà initialisé):', error);
      }
    }
    
    return currentUser;
  }
  
  return new Promise((resolve) => {
    // Ajouter un timeout de 5 secondes pour éviter un blocage infini
    const timeoutId = setTimeout(() => {
      console.error('NotePad - Timeout de l\'authentification après 5 secondes');
      console.log('NotePad - Forçage de l\'initialisation après timeout');
      authInitialized = true; // Marquer comme initialisé pour éviter de futurs blocages
      
      // Créer la barre de navigation même en cas de timeout
      try {
        createMarketplaceNavbar({});
        console.log('NotePad - Barre de navigation créée après timeout');
      } catch (error) {
        console.error('NotePad - Erreur lors de la création de la barre de navigation après timeout:', error);
      }
      
      resolve(null);
    }, 5000);
    
    console.log('NotePad - Appel à initAuth avec pathname:', window.location.pathname);
    
    try {
      initAuth({
        ...options,
        // Désactiver la redirection automatique
        requireAuth: false,
        onSuccess: (user) => {
          clearTimeout(timeoutId); // Annuler le timeout
          console.log('NotePad - Authentification réussie, utilisateur:', user);
          authInitialized = true;
          currentUser = user;
          
          // Créer la barre de navigation si demandé
          if (options.createNavbar !== false) {
            try {
              createMarketplaceNavbar(options.navbarOptions || {});
              console.log('NotePad - Barre de navigation créée avec succès');
            } catch (error) {
              console.error('NotePad - Erreur lors de la création de la barre de navigation:', error);
            }
          }
          
          // Appeler le callback de succès original si fourni
          if (options.onSuccess) {
            try {
              options.onSuccess(user);
            } catch (error) {
              console.error('NotePad - Erreur dans le callback onSuccess:', error);
            }
          }
          
          resolve(user);
        },
        onFailure: (reason) => {
          clearTimeout(timeoutId); // Annuler le timeout
          console.error(`NotePad - Échec de l'authentification: ${reason}`);
          
          // Créer la barre de navigation même en cas d'échec
          try {
            createMarketplaceNavbar({});
            console.log('NotePad - Barre de navigation créée après échec');
          } catch (error) {
            console.error('NotePad - Erreur lors de la création de la barre de navigation après échec:', error);
          }
          
          // Appeler le callback d'échec original si fourni
          if (options.onFailure) {
            try {
              options.onFailure(reason);
            } catch (error) {
              console.error('NotePad - Erreur dans le callback onFailure:', error);
            }
          }
          
          authInitialized = true; // Marquer comme initialisé même en cas d'échec
          resolve(null);
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('NotePad - Erreur lors de l\'appel à initAuth:', error);
      authInitialized = true;
      resolve(null);
    }
  });
};

// Variable pour suivre si la barre de navigation a déjà été créée
let navbarCreated = false;

/**
 * Crée la barre de navigation de la Marketplace
 * @param {Object} options - Options de la barre de navigation
 * @returns {HTMLElement|null} - Élément de la barre de navigation ou null si déjà créée
 */
const createMarketplaceNavbar = (options = {}) => {
  console.log('NotePad - Vérification de la barre de navigation existante');
  
  // Vérifier si la barre de navigation a déjà été créée
  if (navbarCreated) {
    console.log('NotePad - Barre de navigation déjà créée, ignoré');
    return null;
  }
  
  // Vérifier si le conteneur de la barre de navigation existe déjà
  const existingNavbar = document.querySelector('.navbar');
  if (existingNavbar) {
    console.log('NotePad - Élément navbar existant trouvé, suppression');
    existingNavbar.parentNode.removeChild(existingNavbar);
  }
  
  // Créer la nouvelle barre de navigation
  console.log('NotePad - Création d\'une nouvelle barre de navigation');
  const navbar = createNavbar({
    appName: 'NotePad',
    ...options
  });
  
  // Marquer la barre de navigation comme créée
  navbarCreated = true;
  
  return navbar;
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

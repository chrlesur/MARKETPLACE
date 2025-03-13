/**
 * Module d'intégration de Transkryptor avec la Marketplace
 * Ce module permet d'intégrer Transkryptor à la Marketplace en utilisant les modules partagés
 * 
 * @module apps/transkryptor/public/js/marketplace-integration
 * @author Marketplace Team
 * @version 1.0.0
 */

// Importer les modules partagés
import { initAuth, getUserInfo, addAuthHeader } from '/shared/auth.js';
import { showSuccess, showError, showInfo, showWarning } from '/shared/notifications.js';
import { createNavbar } from '/shared/navbar.js';

/**
 * Initialise l'intégration avec la Marketplace
 * Cette fonction doit être appelée au chargement de l'application
 */
const initMarketplaceIntegration = () => {
  // Initialiser l'authentification
  initAuth({
    requireAuth: true,
    onSuccess: (user) => {
      console.log('Authentification réussie pour Transkryptor');
      
      // Créer la barre de navigation
      createNavbar({
        appName: 'Transkryptor',
        menuItems: [
          { 
            label: 'Documentation', 
            url: 'https://github.com/marketplace/transkryptor/docs',
            onClick: (e) => {
              e.preventDefault();
              window.open('https://github.com/marketplace/transkryptor/docs', '_blank');
            }
          }
        ]
      });
      
      // Afficher un message de bienvenue
      showSuccess(`Bienvenue sur Transkryptor, ${user.name} !`);
    },
    onFailure: (reason) => {
      console.error(`Échec de l'authentification: ${reason}`);
    }
  });
  
  // Remplacer les fonctions de journalisation par des notifications
  enhanceLogger();
  
  // Ajouter l'en-tête d'authentification aux requêtes API
  enhanceApiRequests();
};

/**
 * Améliore le système de journalisation de Transkryptor
 * en ajoutant des notifications pour les messages importants
 */
const enhanceLogger = () => {
  // Sauvegarder les fonctions originales
  const originalSuccess = window.Logger?.success;
  const originalError = window.Logger?.error;
  const originalWarning = window.Logger?.warn;
  const originalInfo = window.Logger?.info;
  
  // Si le Logger existe, remplacer ses fonctions
  if (window.Logger) {
    // Remplacer la fonction success
    window.Logger.success = (message) => {
      // Appeler la fonction originale
      if (originalSuccess) originalSuccess(message);
      
      // Afficher une notification
      showSuccess(message);
    };
    
    // Remplacer la fonction error
    window.Logger.error = (message, error) => {
      // Appeler la fonction originale
      if (originalError) originalError(message, error);
      
      // Afficher une notification
      showError(message);
    };
    
    // Remplacer la fonction warning
    window.Logger.warn = (message) => {
      // Appeler la fonction originale
      if (originalWarning) originalWarning(message);
      
      // Afficher une notification
      showWarning(message);
    };
    
    // Remplacer la fonction info pour les messages importants
    window.Logger.info = (message) => {
      // Appeler la fonction originale
      if (originalInfo) originalInfo(message);
      
      // Afficher une notification pour certains messages importants
      if (
        message.includes('Transcription terminée') ||
        message.includes('Analyse terminée') ||
        message.includes('Synthèse terminée')
      ) {
        showInfo(message);
      }
    };
  }
};

/**
 * Améliore les requêtes API de Transkryptor
 * en ajoutant l'en-tête d'authentification
 */
const enhanceApiRequests = () => {
  // Sauvegarder la fonction fetch originale
  const originalFetch = window.fetch;
  
  // Remplacer la fonction fetch
  window.fetch = async (url, options = {}) => {
    // Ajouter l'en-tête d'authentification
    const headers = addAuthHeader(options.headers || {});
    
    // Appeler la fonction fetch originale avec les en-têtes modifiés
    return originalFetch(url, {
      ...options,
      headers
    });
  };
  
  // Sauvegarder la fonction XMLHttpRequest.open originale
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  
  // Remplacer la fonction XMLHttpRequest.open
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // Sauvegarder l'URL pour l'utiliser dans setRequestHeader
    this._url = url;
    
    // Appeler la fonction originale
    return originalXhrOpen.apply(this, arguments);
  };
  
  // Remplacer la fonction XMLHttpRequest.setRequestHeader
  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    // Appeler la fonction originale
    originalXhrSetRequestHeader.apply(this, arguments);
    
    // Ajouter l'en-tête d'authentification si ce n'est pas déjà fait
    if (header !== 'Authorization') {
      const token = localStorage.getItem('token');
      if (token) {
        originalXhrSetRequestHeader.call(this, 'Authorization', `Bearer ${token}`);
      }
    }
  };
  
  // Sauvegarder la fonction axios.create originale si axios est disponible
  if (window.axios) {
    const originalAxiosCreate = window.axios.create;
    
    // Remplacer la fonction axios.create
    window.axios.create = (config = {}) => {
      // Créer une instance axios avec la configuration originale
      const instance = originalAxiosCreate(config);
      
      // Ajouter un intercepteur pour les requêtes
      instance.interceptors.request.use(
        (config) => {
          // Ajouter l'en-tête d'authentification
          config.headers = addAuthHeader(config.headers || {});
          return config;
        },
        (error) => Promise.reject(error)
      );
      
      return instance;
    };
  }
};

/**
 * Améliore les fonctions de test des clés API
 * en ajoutant des notifications et en gérant les erreurs
 */
const enhanceApiKeyTesting = () => {
  // Sauvegarder la fonction originale
  const originalTestAPIKeys = window.testAPIKeys;
  
  // Remplacer la fonction
  window.testAPIKeys = async () => {
    try {
      // Afficher une notification
      showInfo('Test des clés API en cours...');
      
      // Appeler la fonction originale
      await originalTestAPIKeys();
      
      // La fonction originale gère déjà les notifications de succès via Logger.success
    } catch (error) {
      // Afficher une notification d'erreur
      showError(`Erreur lors du test des clés API: ${error.message}`);
    }
  };
};

/**
 * Améliore les fonctions de traitement audio
 * en ajoutant des notifications et en gérant les erreurs
 */
const enhanceAudioProcessing = () => {
  // Sauvegarder la fonction originale
  const originalProcessAudio = window.processAudio;
  
  // Remplacer la fonction
  window.processAudio = async () => {
    try {
      // Afficher une notification
      showInfo('Traitement audio en cours...');
      
      // Appeler la fonction originale
      await originalProcessAudio();
      
      // La fonction originale gère déjà les notifications de succès via Logger.success
    } catch (error) {
      // Afficher une notification d'erreur
      showError(`Erreur lors du traitement audio: ${error.message}`);
    }
  };
};

// Exporter les fonctions
export {
  initMarketplaceIntegration,
  enhanceLogger,
  enhanceApiRequests,
  enhanceApiKeyTesting,
  enhanceAudioProcessing
};

// Initialiser l'intégration au chargement du module
document.addEventListener('DOMContentLoaded', () => {
  initMarketplaceIntegration();
  enhanceApiKeyTesting();
  enhanceAudioProcessing();
});

/**
 * Service des applications
 * 
 * Ce service gère les opérations liées aux applications :
 * récupération, création, mise à jour, suppression, évaluations, etc.
 * 
 * @module services/apps
 * @author Marketplace Team
 * @version 1.0.0
 */

import { get, post, put, del, logDebug, logError } from './api';

// ========================================================================
// Fonctions principales
// ========================================================================

/**
 * Récupère toutes les applications avec filtrage, pagination et tri
 * @param {Object} params - Paramètres de filtrage, pagination et tri
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=10] - Nombre d'éléments par page
 * @param {string} [params.category] - ID de la catégorie pour filtrer
 * @param {string} [params.search] - Terme de recherche
 * @param {string} [params.sort] - Champ de tri (newest, oldest, name_asc, name_desc, popular, rating)
 * @returns {Promise<Object>} Résultat paginé avec les applications et les informations de pagination
 * @throws {Error} En cas d'échec de la récupération
 */
const getApps = async (params = {}) => {
  try {
    logDebug('Récupération des applications', params);
    
    // Appel à l'API pour récupérer les applications
    const data = await get('/apps', params);
    
    logDebug('Applications récupérées', data);
    
    return data;
  } catch (error) {
    logError('Erreur lors de la récupération des applications', error);
    throw error;
  }
};

/**
 * Récupère une application par son ID
 * @param {string} id - ID de l'application
 * @returns {Promise<Object>} Données de l'application
 * @throws {Error} En cas d'échec de la récupération
 */
const getAppById = async (id) => {
  try {
    if (!id) {
      throw new Error('ID de l\'application requis');
    }
    
    logDebug('Récupération de l\'application par ID', { id });
    
    // Appel à l'API pour récupérer l'application
    const data = await get(`/apps/${id}`);
    
    logDebug('Application récupérée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la récupération de l'application (ID: ${id})`, error);
    throw error;
  }
};

/**
 * Récupère une application par son slug
 * @param {string} slug - Slug de l'application
 * @returns {Promise<Object>} Données de l'application
 * @throws {Error} En cas d'échec de la récupération
 */
const getAppBySlug = async (slug) => {
  try {
    if (!slug) {
      throw new Error('Slug de l\'application requis');
    }
    
    logDebug('Récupération de l\'application par slug', { slug });
    
    // Appel à l'API pour récupérer l'application
    const data = await get(`/apps/slug/${slug}`);
    
    logDebug('Application récupérée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la récupération de l'application (Slug: ${slug})`, error);
    throw error;
  }
};

/**
 * Crée une nouvelle application (admin uniquement)
 * @param {Object} appData - Données de l'application à créer
 * @param {string} appData.name - Nom de l'application
 * @param {Object} appData.description - Description de l'application
 * @param {string} appData.description.short - Description courte
 * @param {string} appData.description.full - Description complète
 * @param {Object} appData.developer - Informations sur le développeur
 * @param {string} appData.category - ID de la catégorie
 * @param {Array<string>} appData.tags - Tags de l'application
 * @param {Object} appData.images - Images de l'application
 * @param {Object} appData.pricing - Informations sur le prix
 * @param {string} appData.url - URL de l'application
 * @param {string} appData.version - Version de l'application
 * @returns {Promise<Object>} Données de l'application créée
 * @throws {Error} En cas d'échec de la création
 */
const createApp = async (appData) => {
  try {
    if (!appData || !appData.name) {
      throw new Error('Données de l\'application requises');
    }
    
    logDebug('Création d\'une nouvelle application', appData);
    
    // Appel à l'API pour créer l'application
    const data = await post('/apps', appData);
    
    logDebug('Application créée', data);
    
    return data;
  } catch (error) {
    logError('Erreur lors de la création de l\'application', error);
    throw error;
  }
};

/**
 * Met à jour une application existante (admin uniquement)
 * @param {string} id - ID de l'application à mettre à jour
 * @param {Object} appData - Données de l'application à mettre à jour
 * @returns {Promise<Object>} Données de l'application mise à jour
 * @throws {Error} En cas d'échec de la mise à jour
 */
const updateApp = async (id, appData) => {
  try {
    if (!id) {
      throw new Error('ID de l\'application requis');
    }
    
    if (!appData) {
      throw new Error('Données de l\'application requises');
    }
    
    logDebug('Mise à jour de l\'application', { id, appData });
    
    // Appel à l'API pour mettre à jour l'application
    const data = await put(`/apps/${id}`, appData);
    
    logDebug('Application mise à jour', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la mise à jour de l'application (ID: ${id})`, error);
    throw error;
  }
};

/**
 * Supprime une application (admin uniquement)
 * @param {string} id - ID de l'application à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 * @throws {Error} En cas d'échec de la suppression
 */
const deleteApp = async (id) => {
  try {
    if (!id) {
      throw new Error('ID de l\'application requis');
    }
    
    logDebug('Suppression de l\'application', { id });
    
    // Appel à l'API pour supprimer l'application
    const data = await del(`/apps/${id}`);
    
    logDebug('Application supprimée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la suppression de l'application (ID: ${id})`, error);
    throw error;
  }
};

/**
 * Ajoute une évaluation à une application
 * @param {string} appId - ID de l'application
 * @param {number} rating - Note (1-5)
 * @param {string} comment - Commentaire
 * @returns {Promise<Object>} Résultat de l'ajout de l'évaluation
 * @throws {Error} En cas d'échec de l'ajout
 */
const addRating = async (appId, rating, comment) => {
  try {
    if (!appId) {
      throw new Error('ID de l\'application requis');
    }
    
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Note valide requise (1-5)');
    }
    
    logDebug('Ajout d\'une évaluation', { appId, rating, comment });
    
    // Appel à l'API pour ajouter l'évaluation
    const data = await post(`/apps/${appId}/ratings`, { rating, comment });
    
    logDebug('Évaluation ajoutée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de l'ajout de l'évaluation (App ID: ${appId})`, error);
    throw error;
  }
};

/**
 * Supprime une évaluation d'une application
 * @param {string} appId - ID de l'application
 * @returns {Promise<Object>} Résultat de la suppression
 * @throws {Error} En cas d'échec de la suppression
 */
const deleteRating = async (appId) => {
  try {
    if (!appId) {
      throw new Error('ID de l\'application requis');
    }
    
    logDebug('Suppression de l\'évaluation', { appId });
    
    // Appel à l'API pour supprimer l'évaluation
    const data = await del(`/apps/${appId}/ratings`);
    
    logDebug('Évaluation supprimée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la suppression de l'évaluation (App ID: ${appId})`, error);
    throw error;
  }
};

/**
 * Incrémente le compteur de téléchargements d'une application
 * @param {string} appId - ID de l'application
 * @returns {Promise<Object>} Résultat de l'incrémentation
 * @throws {Error} En cas d'échec de l'incrémentation
 */
const incrementDownloads = async (appId) => {
  try {
    if (!appId) {
      throw new Error('ID de l\'application requis');
    }
    
    logDebug('Incrémentation du compteur de téléchargements', { appId });
    
    // Appel à l'API pour incrémenter le compteur
    const data = await post(`/apps/${appId}/download`);
    
    logDebug('Compteur incrémenté', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de l'incrémentation du compteur (App ID: ${appId})`, error);
    throw error;
  }
};

// ========================================================================
// Exportations
// ========================================================================

export {
  getApps,
  getAppById,
  getAppBySlug,
  createApp,
  updateApp,
  deleteApp,
  addRating,
  deleteRating,
  incrementDownloads
};

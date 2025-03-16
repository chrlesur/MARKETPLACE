/**
 * Service pour la gestion des paramètres de l'application
 * 
 * Ce service permet de récupérer et de mettre à jour les paramètres globaux
 * de l'application via l'API.
 * 
 * @module services/settings
 * @author Marketplace Team
 * @version 1.0.0
 */

import { get, put, logError } from './api';

/**
 * URL de base pour les endpoints liés aux paramètres
 * @constant {string}
 */
const BASE_URL = '/settings';

/**
 * Récupère tous les paramètres de l'application
 * @returns {Promise<Object>} Paramètres de l'application
 */
export const getSettings = async () => {
  try {
    const response = await get(BASE_URL);
    return response;
  } catch (error) {
    logError('Erreur lors de la récupération des paramètres', error);
    // Retourner des paramètres par défaut en cas d'erreur
    return {
      siteName: 'Marketplace Web',
      siteDescription: 'Découvrez des applications web innovantes',
      contactEmail: 'contact@marketplace.example.com',
      apiKey: '••••••••••••••••',
      enableRegistration: true,
      enableNotifications: true,
      maintenanceMode: false,
      analyticsId: 'UA-XXXXXXXXX-X',
      enableAnalytics: true,
      collectUserData: true,
      showStatsToUsers: false,
      dataRetentionPeriod: 365
    };
  }
};

/**
 * Met à jour les paramètres de l'application
 * @param {Object} settings - Nouveaux paramètres à enregistrer
 * @returns {Promise<Object>} Paramètres mis à jour
 */
export const updateSettings = async (settings) => {
  try {
    const response = await put(BASE_URL, settings);
    return response;
  } catch (error) {
    logError('Erreur lors de la mise à jour des paramètres', error);
    throw error;
  }
};

/**
 * Réinitialise les paramètres de l'application aux valeurs par défaut
 * @returns {Promise<Object>} Paramètres réinitialisés
 */
export const resetSettings = async () => {
  try {
    const response = await put(`${BASE_URL}/reset`);
    return response;
  } catch (error) {
    logError('Erreur lors de la réinitialisation des paramètres', error);
    throw error;
  }
};

export default {
  getSettings,
  updateSettings,
  resetSettings
};

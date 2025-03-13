/**
 * Service des utilisateurs
 * 
 * Ce service gère les opérations liées aux utilisateurs :
 * récupération, mise à jour, suppression, etc.
 * 
 * @module services/users
 * @author Marketplace Team
 * @version 1.0.0
 */

import { get, put, del, logDebug, logError } from './api';

// ========================================================================
// Fonctions principales
// ========================================================================

/**
 * Récupère tous les utilisateurs avec pagination (admin uniquement)
 * @param {Object} params - Paramètres de pagination et filtrage
 * @param {number} [params.page=1] - Numéro de page
 * @param {number} [params.limit=10] - Nombre d'éléments par page
 * @param {string} [params.search] - Terme de recherche (nom ou email)
 * @param {boolean} [params.isActive] - Filtre sur le statut actif/inactif
 * @param {string} [params.role] - Filtre sur le rôle (user, admin)
 * @returns {Promise<Object>} Résultat paginé avec les utilisateurs et les informations de pagination
 * @throws {Error} En cas d'échec de la récupération
 */
const getUsers = async (params = {}) => {
  try {
    logDebug('Récupération des utilisateurs', params);
    
    // Appel à l'API pour récupérer les utilisateurs
    const data = await get('/users', params);
    
    logDebug('Utilisateurs récupérés', data);
    
    return data;
  } catch (error) {
    logError('Erreur lors de la récupération des utilisateurs', error);
    throw error;
  }
};

/**
 * Récupère un utilisateur par son ID
 * @param {string} id - ID de l'utilisateur
 * @returns {Promise<Object>} Données de l'utilisateur
 * @throws {Error} En cas d'échec de la récupération
 */
const getUserById = async (id) => {
  try {
    if (!id) {
      throw new Error('ID de l\'utilisateur requis');
    }
    
    logDebug('Récupération de l\'utilisateur par ID', { id });
    
    // Appel à l'API pour récupérer l'utilisateur
    const data = await get(`/users/${id}`);
    
    logDebug('Utilisateur récupéré', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la récupération de l'utilisateur (ID: ${id})`, error);
    throw error;
  }
};

/**
 * Met à jour un utilisateur
 * @param {string} id - ID de l'utilisateur à mettre à jour
 * @param {Object} userData - Données de l'utilisateur à mettre à jour
 * @param {string} [userData.name] - Nom de l'utilisateur
 * @param {string} [userData.email] - Email de l'utilisateur
 * @param {string} [userData.password] - Nouveau mot de passe
 * @param {string} [userData.avatar] - URL de l'avatar
 * @param {boolean} [userData.isActive] - Statut actif/inactif (admin uniquement)
 * @param {string} [userData.role] - Rôle de l'utilisateur (admin uniquement)
 * @returns {Promise<Object>} Données de l'utilisateur mis à jour
 * @throws {Error} En cas d'échec de la mise à jour
 */
const updateUser = async (id, userData) => {
  try {
    if (!id) {
      throw new Error('ID de l\'utilisateur requis');
    }
    
    if (!userData) {
      throw new Error('Données de l\'utilisateur requises');
    }
    
    logDebug('Mise à jour de l\'utilisateur', { id, userData: { ...userData, password: userData.password ? '******' : undefined } });
    
    // Appel à l'API pour mettre à jour l'utilisateur
    const data = await put(`/users/${id}`, userData);
    
    logDebug('Utilisateur mis à jour', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la mise à jour de l'utilisateur (ID: ${id})`, error);
    throw error;
  }
};

/**
 * Supprime un utilisateur (admin uniquement)
 * @param {string} id - ID de l'utilisateur à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 * @throws {Error} En cas d'échec de la suppression
 */
const deleteUser = async (id) => {
  try {
    if (!id) {
      throw new Error('ID de l\'utilisateur requis');
    }
    
    logDebug('Suppression de l\'utilisateur', { id });
    
    // Appel à l'API pour supprimer l'utilisateur
    const data = await del(`/users/${id}`);
    
    logDebug('Utilisateur supprimé', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la suppression de l'utilisateur (ID: ${id})`, error);
    throw error;
  }
};

// ========================================================================
// Exportations
// ========================================================================

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};

/**
 * Service des catégories
 * 
 * Ce service gère les opérations liées aux catégories :
 * récupération, création, mise à jour, suppression, etc.
 * 
 * @module services/categories
 * @author Marketplace Team
 * @version 1.0.0
 */

import { get, post, put, del, logDebug, logError } from './api';

// ========================================================================
// Fonctions principales
// ========================================================================

/**
 * Récupère toutes les catégories avec filtrage
 * @param {Object} params - Paramètres de filtrage
 * @param {boolean} [params.isActive] - Filtre sur le statut actif/inactif
 * @param {string} [params.parent] - Filtre sur la catégorie parente
 * @returns {Promise<Array<Object>>} Liste des catégories
 * @throws {Error} En cas d'échec de la récupération
 */
const getCategories = async (params = {}) => {
  try {
    logDebug('Récupération des catégories', params);
    
    // Appel à l'API pour récupérer les catégories
    const data = await get('/categories', params);
    
    logDebug('Catégories récupérées', data);
    
    return data;
  } catch (error) {
    logError('Erreur lors de la récupération des catégories', error);
    throw error;
  }
};

/**
 * Récupère une catégorie par son ID
 * @param {string} id - ID de la catégorie
 * @returns {Promise<Object>} Données de la catégorie
 * @throws {Error} En cas d'échec de la récupération
 */
const getCategoryById = async (id) => {
  try {
    if (!id) {
      throw new Error('ID de la catégorie requis');
    }
    
    logDebug('Récupération de la catégorie par ID', { id });
    
    // Appel à l'API pour récupérer la catégorie
    const data = await get(`/categories/${id}`);
    
    logDebug('Catégorie récupérée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la récupération de la catégorie (ID: ${id})`, error);
    throw error;
  }
};

/**
 * Récupère une catégorie par son slug
 * @param {string} slug - Slug de la catégorie
 * @returns {Promise<Object>} Données de la catégorie
 * @throws {Error} En cas d'échec de la récupération
 */
const getCategoryBySlug = async (slug) => {
  try {
    if (!slug) {
      throw new Error('Slug de la catégorie requis');
    }
    
    logDebug('Récupération de la catégorie par slug', { slug });
    
    // Appel à l'API pour récupérer la catégorie
    const data = await get(`/categories/slug/${slug}`);
    
    logDebug('Catégorie récupérée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la récupération de la catégorie (Slug: ${slug})`, error);
    throw error;
  }
};

/**
 * Crée une nouvelle catégorie (admin uniquement)
 * @param {Object} categoryData - Données de la catégorie à créer
 * @param {string} categoryData.name - Nom de la catégorie
 * @param {string} categoryData.description - Description de la catégorie
 * @param {string} [categoryData.icon] - Icône de la catégorie
 * @param {string} [categoryData.color] - Couleur de la catégorie
 * @param {boolean} [categoryData.isActive=true] - Statut actif/inactif
 * @param {number} [categoryData.order] - Ordre d'affichage
 * @param {string} [categoryData.parent] - ID de la catégorie parente
 * @returns {Promise<Object>} Données de la catégorie créée
 * @throws {Error} En cas d'échec de la création
 */
const createCategory = async (categoryData) => {
  try {
    if (!categoryData || !categoryData.name) {
      throw new Error('Données de la catégorie requises');
    }
    
    logDebug('Création d\'une nouvelle catégorie', categoryData);
    
    // Appel à l'API pour créer la catégorie
    const data = await post('/categories', categoryData);
    
    logDebug('Catégorie créée', data);
    
    return data;
  } catch (error) {
    logError('Erreur lors de la création de la catégorie', error);
    throw error;
  }
};

/**
 * Met à jour une catégorie existante (admin uniquement)
 * @param {string} id - ID de la catégorie à mettre à jour
 * @param {Object} categoryData - Données de la catégorie à mettre à jour
 * @returns {Promise<Object>} Données de la catégorie mise à jour
 * @throws {Error} En cas d'échec de la mise à jour
 */
const updateCategory = async (id, categoryData) => {
  try {
    if (!id) {
      throw new Error('ID de la catégorie requis');
    }
    
    if (!categoryData) {
      throw new Error('Données de la catégorie requises');
    }
    
    logDebug('Mise à jour de la catégorie', { id, categoryData });
    
    // Appel à l'API pour mettre à jour la catégorie
    const data = await put(`/categories/${id}`, categoryData);
    
    logDebug('Catégorie mise à jour', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la mise à jour de la catégorie (ID: ${id})`, error);
    throw error;
  }
};

/**
 * Supprime une catégorie (admin uniquement)
 * @param {string} id - ID de la catégorie à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 * @throws {Error} En cas d'échec de la suppression
 */
const deleteCategory = async (id) => {
  try {
    if (!id) {
      throw new Error('ID de la catégorie requis');
    }
    
    logDebug('Suppression de la catégorie', { id });
    
    // Appel à l'API pour supprimer la catégorie
    const data = await del(`/categories/${id}`);
    
    logDebug('Catégorie supprimée', data);
    
    return data;
  } catch (error) {
    logError(`Erreur lors de la suppression de la catégorie (ID: ${id})`, error);
    throw error;
  }
};

// ========================================================================
// Exportations
// ========================================================================

export {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};

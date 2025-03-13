/**
 * Routes des catégories
 * 
 * Ce fichier définit les routes liées aux catégories d'applications :
 * liste, détails, création, mise à jour, suppression, etc.
 */

const express = require('express');
const { check } = require('express-validator');
const categoriesController = require('../controllers/categories.controller');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Récupérer toutes les catégories
 * @access  Public
 */
router.get('/', categoriesController.getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Récupérer une catégorie par son ID
 * @access  Public
 */
router.get('/:id', categoriesController.getCategoryById);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Récupérer une catégorie par son slug
 * @access  Public
 */
router.get('/slug/:slug', categoriesController.getCategoryBySlug);

/**
 * @route   POST /api/categories
 * @desc    Créer une nouvelle catégorie
 * @access  Private (Admin)
 */
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('name', 'Le nom est requis').not().isEmpty(),
      check('slug', 'Le slug est requis').not().isEmpty(),
      check('description', 'La description est requise').not().isEmpty()
    ]
  ],
  categoriesController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Mettre à jour une catégorie
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  [
    auth,
    admin,
    [
      check('name', 'Le nom est requis').optional(),
      check('slug', 'Le slug est requis').optional(),
      check('description', 'La description est requise').optional()
    ]
  ],
  categoriesController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Supprimer une catégorie
 * @access  Private (Admin)
 */
router.delete('/:id', [auth, admin], categoriesController.deleteCategory);

module.exports = router;

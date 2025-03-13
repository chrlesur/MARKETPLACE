/**
 * Routes des applications
 * 
 * Ce fichier définit les routes liées aux applications de la marketplace :
 * liste, détails, création, mise à jour, suppression, évaluations, etc.
 */

const express = require('express');
const { check } = require('express-validator');
const appsController = require('../controllers/apps.controller');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/apps
 * @desc    Récupérer toutes les applications
 * @access  Public
 */
router.get('/', appsController.getApps);

/**
 * @route   GET /api/apps/:id
 * @desc    Récupérer une application par son ID
 * @access  Public
 */
router.get('/:id', appsController.getAppById);

/**
 * @route   GET /api/apps/slug/:slug
 * @desc    Récupérer une application par son slug
 * @access  Public
 */
router.get('/slug/:slug', appsController.getAppBySlug);

/**
 * @route   POST /api/apps
 * @desc    Créer une nouvelle application
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
      check('description.short', 'La description courte est requise').not().isEmpty(),
      check('description.full', 'La description complète est requise').not().isEmpty(),
      check('developer.name', 'Le nom du développeur est requis').not().isEmpty(),
      check('category', 'La catégorie est requise').not().isEmpty(),
      check('images.icon', 'L\'icône est requise').not().isEmpty(),
      check('pricing.type', 'Le type de tarification est requis').isIn(['free', 'paid', 'subscription']),
      check('url', 'L\'URL est requise').not().isEmpty()
    ]
  ],
  appsController.createApp
);

/**
 * @route   PUT /api/apps/:id
 * @desc    Mettre à jour une application
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
      check('description.short', 'La description courte est requise').optional(),
      check('description.full', 'La description complète est requise').optional(),
      check('developer.name', 'Le nom du développeur est requis').optional(),
      check('category', 'La catégorie est requise').optional(),
      check('images.icon', 'L\'icône est requise').optional(),
      check('pricing.type', 'Le type de tarification est requis').optional().isIn(['free', 'paid', 'subscription']),
      check('url', 'L\'URL est requise').optional()
    ]
  ],
  appsController.updateApp
);

/**
 * @route   DELETE /api/apps/:id
 * @desc    Supprimer une application
 * @access  Private (Admin)
 */
router.delete('/:id', [auth, admin], appsController.deleteApp);

/**
 * @route   POST /api/apps/:id/ratings
 * @desc    Ajouter une évaluation à une application
 * @access  Private
 */
router.post(
  '/:id/ratings',
  [
    auth,
    [
      check('rating', 'La note est requise').isInt({ min: 1, max: 5 }),
      check('comment', 'Le commentaire est requis').optional()
    ]
  ],
  appsController.addRating
);

/**
 * @route   DELETE /api/apps/:id/ratings
 * @desc    Supprimer une évaluation d'une application
 * @access  Private
 */
router.delete('/:id/ratings', auth, appsController.deleteRating);

/**
 * @route   POST /api/apps/:id/download
 * @desc    Incrémenter le compteur de téléchargements d'une application
 * @access  Public
 */
router.post('/:id/download', appsController.incrementDownloads);

module.exports = router;

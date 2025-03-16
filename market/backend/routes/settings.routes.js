/**
 * Routes pour les paramètres de l'application
 * 
 * Ce fichier définit les routes pour la gestion des paramètres de l'application.
 * Il permet de récupérer, mettre à jour et réinitialiser les paramètres.
 * 
 * @module routes/settings
 * @author Marketplace Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth');

/**
 * @route GET /api/settings
 * @desc Récupère tous les paramètres de l'application
 * @access Public
 */
router.get('/', settingsController.getSettings);

/**
 * @route PUT /api/settings
 * @desc Met à jour les paramètres de l'application
 * @access Private (Admin only)
 */
router.put('/', authMiddleware.auth, authMiddleware.admin, settingsController.updateSettings);

/**
 * @route PUT /api/settings/reset
 * @desc Réinitialise les paramètres de l'application aux valeurs par défaut
 * @access Private (Admin only)
 */
router.put('/reset', authMiddleware.auth, authMiddleware.admin, settingsController.resetSettings);

/**
 * @route GET /api/settings/:key
 * @desc Récupère un paramètre spécifique par sa clé
 * @access Public
 */
router.get('/:key', settingsController.getSettingByKey);

/**
 * @route PUT /api/settings/:key
 * @desc Met à jour un paramètre spécifique par sa clé
 * @access Private (Admin only)
 */
router.put('/:key', authMiddleware.auth, authMiddleware.admin, settingsController.updateSettingByKey);

module.exports = router;

/**
 * Routes d'authentification
 * 
 * Ce fichier définit les routes liées à l'authentification des utilisateurs :
 * inscription, connexion, récupération des informations utilisateur, etc.
 */

const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscrire un nouvel utilisateur
 * @access  Public
 */
router.post(
  '/register',
  [
    check('name', 'Le nom est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 })
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Connecter un utilisateur et obtenir un token
 * @access  Public
 */
router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists()
  ],
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Récupérer les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', auth, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion (côté client uniquement)
 * @access  Private
 */
router.post('/logout', auth, authController.logout);

module.exports = router;

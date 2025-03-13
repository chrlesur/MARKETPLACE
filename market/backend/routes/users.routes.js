/**
 * Routes des utilisateurs
 * 
 * Ce fichier définit les routes liées aux utilisateurs :
 * liste, détails, mise à jour, suppression, etc.
 */

const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users.controller');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Récupérer tous les utilisateurs
 * @access  Private (Admin)
 */
router.get('/', [auth, admin], usersController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Récupérer un utilisateur par son ID
 * @access  Private (Admin ou Propriétaire)
 */
router.get('/:id', auth, usersController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Private (Admin ou Propriétaire)
 */
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Le nom est requis').optional(),
      check('email', 'Veuillez inclure un email valide').optional().isEmail(),
      check('password', 'Le mot de passe doit contenir au moins 6 caractères').optional().isLength({ min: 6 })
    ]
  ],
  usersController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private (Admin ou Propriétaire)
 */
router.delete('/:id', auth, usersController.deleteUser);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Mettre à jour le mot de passe d'un utilisateur
 * @access  Private (Admin ou Propriétaire)
 */
router.put(
  '/:id/password',
  [
    auth,
    [
      check('currentPassword', 'Le mot de passe actuel est requis').exists(),
      check('newPassword', 'Le nouveau mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 })
    ]
  ],
  usersController.updatePassword
);

module.exports = router;

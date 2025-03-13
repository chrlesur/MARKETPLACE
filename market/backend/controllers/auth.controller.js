/**
 * Contrôleur d'authentification
 * 
 * Ce contrôleur gère les fonctionnalités liées à l'authentification des utilisateurs :
 * inscription, connexion, récupération des informations utilisateur, etc.
 */

const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @desc    Inscrire un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Créer un nouvel utilisateur
    user = new User({
      name,
      email,
      password
    });
    
    // Enregistrer l'utilisateur dans la base de données
    await user.save();
    
    // Générer un token JWT
    const token = user.generateAuthToken();
    
    // Retourner le token et les informations de l'utilisateur
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};

/**
 * @desc    Connecter un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier si le mot de passe est correct
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Mettre à jour la date de dernière connexion
    await user.updateLastLogin();
    
    // Générer un token JWT
    const token = user.generateAuthToken();
    
    // Retourner le token et les informations de l'utilisateur
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

/**
 * @desc    Récupérer les informations de l'utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // Récupérer l'utilisateur depuis la base de données (sans le mot de passe)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des informations utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Déconnexion (côté client uniquement)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = (req, res) => {
  // La déconnexion est gérée côté client en supprimant le token
  // Cette route est fournie pour la cohérence de l'API
  res.json({ message: 'Déconnexion réussie' });
};

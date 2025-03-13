/**
 * Contrôleur des utilisateurs
 * 
 * Ce contrôleur gère les fonctionnalités liées aux utilisateurs :
 * liste, détails, mise à jour, suppression, etc.
 */

const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/users
 * @access  Private (Admin)
 */
exports.getUsers = async (req, res) => {
  try {
    // Paramètres de pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Paramètres de filtrage
    const filter = {};
    
    // Filtrer par rôle
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Filtrer par recherche
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filtrer par statut
    if (req.query.isActive) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    // Paramètres de tri
    let sort = {};
    
    switch (req.query.sort) {
      case 'name_asc':
        sort = { name: 1 };
        break;
      case 'name_desc':
        sort = { name: -1 };
        break;
      case 'email_asc':
        sort = { email: 1 };
        break;
      case 'email_desc':
        sort = { email: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    // Exécuter la requête
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Compter le nombre total d'utilisateurs
    const total = await User.countDocuments(filter);
    
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Récupérer un utilisateur par son ID
 * @route   GET /api/users/:id
 * @access  Private (Admin ou Propriétaire)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est autorisé à accéder à ces informations
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Mettre à jour un utilisateur
 * @route   PUT /api/users/:id
 * @access  Private (Admin ou Propriétaire)
 */
exports.updateUser = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password, avatar, isActive, role } = req.body;
    
    // Vérifier si l'utilisateur existe
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est autorisé à mettre à jour ces informations
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }
    
    // Préparer les données de mise à jour
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    
    // Seul un administrateur peut modifier ces champs
    if (req.user.role === 'admin') {
      if (isActive !== undefined) updateData.isActive = isActive;
      if (role) updateData.role = role;
    }
    
    // Mettre à jour le mot de passe si fourni
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Mettre à jour l'utilisateur
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/users/:id
 * @access  Private (Admin ou Propriétaire)
 */
exports.deleteUser = async (req, res) => {
  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est autorisé à supprimer ce compte
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Supprimer l'utilisateur
    await user.remove();
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Mettre à jour le mot de passe d'un utilisateur
 * @route   PUT /api/users/:id/password
 * @access  Private (Admin ou Propriétaire)
 */
exports.updatePassword = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est autorisé à mettre à jour ce mot de passe
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Si l'utilisateur n'est pas un administrateur, vérifier le mot de passe actuel
    if (req.user.role !== 'admin') {
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
      }
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du mot de passe:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

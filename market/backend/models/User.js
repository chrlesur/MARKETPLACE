/**
 * Modèle User pour la base de données
 * 
 * Ce modèle définit la structure des documents utilisateur dans la base de données.
 * Il inclut également des méthodes pour la gestion des mots de passe et la génération de tokens JWT.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Schéma utilisateur
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas inclure le mot de passe dans les requêtes par défaut
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Middleware pour hacher le mot de passe avant l'enregistrement
userSchema.pre('save', async function(next) {
  // Ne pas rehacher le mot de passe s'il n'a pas été modifié
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Générer un sel
    const salt = await bcrypt.genSalt(10);
    
    // Hacher le mot de passe avec le sel
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// Méthode pour générer un token JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Méthode pour mettre à jour la date de dernière connexion
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  await this.save();
};

// Créer et exporter le modèle
const User = mongoose.model('User', userSchema);

module.exports = User;

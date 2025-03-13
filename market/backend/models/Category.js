/**
 * Modèle Category pour la base de données
 * 
 * Ce modèle définit la structure des documents de catégorie dans la base de données.
 * Il représente les catégories d'applications disponibles dans la marketplace.
 */

const mongoose = require('mongoose');

// Schéma pour les catégories
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  icon: {
    type: String,
    default: 'default-category-icon.png'
  },
  color: {
    type: String,
    default: '#4f46e5' // Couleur par défaut (indigo)
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuel pour obtenir les applications de cette catégorie
categorySchema.virtual('apps', {
  ref: 'App',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

// Virtuel pour obtenir les sous-catégories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  justOne: false
});

// Middleware pour mettre à jour la date de modification
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir le nombre d'applications dans cette catégorie
categorySchema.methods.getAppsCount = async function() {
  const App = mongoose.model('App');
  return await App.countDocuments({ category: this._id, isActive: true });
};

// Créer et exporter le modèle
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

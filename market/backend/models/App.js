/**
 * Modèle App pour la base de données
 * 
 * Ce modèle définit la structure des documents d'application dans la base de données.
 * Il représente les applications disponibles dans la marketplace.
 */

const mongoose = require('mongoose');

// Schéma pour les captures d'écran
const screenshotSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  }
}, { _id: false });

// Schéma pour les évaluations
const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma principal pour les applications
const appSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'application est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    short: {
      type: String,
      required: [true, 'La description courte est requise'],
      trim: true,
      maxlength: [200, 'La description courte ne peut pas dépasser 200 caractères']
    },
    full: {
      type: String,
      required: [true, 'La description complète est requise'],
      trim: true
    }
  },
  developer: {
    name: {
      type: String,
      required: [true, 'Le nom du développeur est requis'],
      trim: true
    },
    website: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie est requise']
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: {
    icon: {
      type: String,
      required: [true, 'L\'icône est requise']
    },
    banner: {
      type: String,
      default: ''
    },
    screenshots: [screenshotSchema]
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      required: [true, 'Le type de tarification est requis']
    },
    price: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    trialDays: {
      type: Number,
      default: 0
    }
  },
  url: {
    type: String,
    required: [true, 'L\'URL de l\'application est requise']
  },
  apiEndpoint: {
    type: String,
    default: ''
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  requirements: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  ratings: [ratingSchema],
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
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

// Virtuel pour calculer la note moyenne
appSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) {
    return 0;
  }
  
  const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtuel pour obtenir le nombre d'évaluations
appSchema.virtual('ratingsCount').get(function() {
  return this.ratings.length;
});

// Middleware pour mettre à jour la date de modification
appSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Créer et exporter le modèle
const App = mongoose.model('App', appSchema);

module.exports = App;

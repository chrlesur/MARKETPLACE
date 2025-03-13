/**
 * Contrôleur des applications
 * 
 * Ce contrôleur gère les fonctionnalités liées aux applications de la marketplace :
 * liste, détails, création, mise à jour, suppression, etc.
 */

const App = require('../models/App');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

/**
 * @desc    Récupérer toutes les applications
 * @route   GET /api/apps
 * @access  Public
 */
exports.getApps = async (req, res) => {
  try {
    // Paramètres de pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Paramètres de filtrage
    const filter = { isActive: true };
    
    // Filtrer par catégorie
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filtrer par recherche
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { 'description.short': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filtrer par prix
    if (req.query.pricing) {
      filter['pricing.type'] = req.query.pricing;
    }
    
    // Filtrer par tags
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      filter.tags = { $in: tags };
    }
    
    // Paramètres de tri
    let sort = {};
    
    switch (req.query.sort) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'name_asc':
        sort = { name: 1 };
        break;
      case 'name_desc':
        sort = { name: -1 };
        break;
      case 'popular':
        sort = { downloads: -1 };
        break;
      case 'rating':
        sort = { averageRating: -1 };
        break;
      default:
        sort = { isFeatured: -1, createdAt: -1 };
    }
    
    // Exécuter la requête
    const apps = await App.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Compter le nombre total d'applications
    const total = await App.countDocuments(filter);
    
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      apps,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des applications:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Récupérer une application par son ID
 * @route   GET /api/apps/:id
 * @access  Public
 */
exports.getAppById = async (req, res) => {
  try {
    const app = await App.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('ratings.user', 'name avatar');
    
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    // Incrémenter le compteur de vues
    app.views += 1;
    await app.save();
    
    res.json(app);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'application:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Récupérer une application par son slug
 * @route   GET /api/apps/slug/:slug
 * @access  Public
 */
exports.getAppBySlug = async (req, res) => {
  try {
    const app = await App.findOne({ slug: req.params.slug })
      .populate('category', 'name slug description')
      .populate('ratings.user', 'name avatar');
    
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    // Incrémenter le compteur de vues
    app.views += 1;
    await app.save();
    
    res.json(app);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'application:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Créer une nouvelle application
 * @route   POST /api/apps
 * @access  Private (Admin)
 */
exports.createApp = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      slug,
      description,
      developer,
      category,
      tags,
      images,
      pricing,
      url,
      apiEndpoint,
      version,
      requirements,
      isFeatured
    } = req.body;
    
    // Vérifier si la catégorie existe
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Catégorie non trouvée' });
    }
    
    // Vérifier si le slug est déjà utilisé
    const slugExists = await App.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'Ce slug est déjà utilisé' });
    }
    
    // Créer une nouvelle application
    const app = new App({
      name,
      slug,
      description,
      developer,
      category,
      tags,
      images,
      pricing,
      url,
      apiEndpoint,
      version,
      requirements,
      isFeatured
    });
    
    // Enregistrer l'application dans la base de données
    const savedApp = await app.save();
    
    res.status(201).json(savedApp);
  } catch (err) {
    console.error('Erreur lors de la création de l\'application:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Mettre à jour une application
 * @route   PUT /api/apps/:id
 * @access  Private (Admin)
 */
exports.updateApp = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      slug,
      description,
      developer,
      category,
      tags,
      images,
      pricing,
      url,
      apiEndpoint,
      version,
      requirements,
      isActive,
      isFeatured
    } = req.body;
    
    // Vérifier si l'application existe
    let app = await App.findById(req.params.id);
    
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    // Vérifier si la catégorie existe
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Catégorie non trouvée' });
      }
    }
    
    // Vérifier si le slug est déjà utilisé par une autre application
    if (slug && slug !== app.slug) {
      const slugExists = await App.findOne({ slug, _id: { $ne: req.params.id } });
      if (slugExists) {
        return res.status(400).json({ message: 'Ce slug est déjà utilisé' });
      }
    }
    
    // Mettre à jour l'application
    app = await App.findByIdAndUpdate(
      req.params.id,
      {
        name: name || app.name,
        slug: slug || app.slug,
        description: description || app.description,
        developer: developer || app.developer,
        category: category || app.category,
        tags: tags || app.tags,
        images: images || app.images,
        pricing: pricing || app.pricing,
        url: url || app.url,
        apiEndpoint: apiEndpoint || app.apiEndpoint,
        version: version || app.version,
        requirements: requirements || app.requirements,
        isActive: isActive !== undefined ? isActive : app.isActive,
        isFeatured: isFeatured !== undefined ? isFeatured : app.isFeatured,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.json(app);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'application:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Supprimer une application
 * @route   DELETE /api/apps/:id
 * @access  Private (Admin)
 */
exports.deleteApp = async (req, res) => {
  try {
    // Vérifier si l'application existe
    const app = await App.findById(req.params.id);
    
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    // Supprimer l'application
    await app.remove();
    
    res.json({ message: 'Application supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'application:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Ajouter une évaluation à une application
 * @route   POST /api/apps/:id/ratings
 * @access  Private
 */
exports.addRating = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { rating, comment } = req.body;
    
    // Vérifier si l'application existe
    const app = await App.findById(req.params.id);
    
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    // Vérifier si l'utilisateur a déjà évalué cette application
    const alreadyRated = app.ratings.find(
      r => r.user.toString() === req.user.id
    );
    
    if (alreadyRated) {
      // Mettre à jour l'évaluation existante
      app.ratings.forEach(r => {
        if (r.user.toString() === req.user.id) {
          r.rating = rating;
          r.comment = comment;
        }
      });
    } else {
      // Ajouter une nouvelle évaluation
      app.ratings.push({
        user: req.user.id,
        rating,
        comment
      });
    }
    
    // Enregistrer les modifications
    await app.save();
    
    // Récupérer l'application mise à jour avec les informations utilisateur
    const updatedApp = await App.findById(req.params.id)
      .populate('ratings.user', 'name avatar');
    
    res.json(updatedApp);
  } catch (err) {
    console.error('Erreur lors de l\'ajout de l\'évaluation:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Supprimer une évaluation d'une application
 * @route   DELETE /api/apps/:id/ratings
 * @access  Private
 */
exports.deleteRating = async (req, res) => {
  try {
    // Vérifier si l'application existe
    const app = await App.findById(req.params.id);
    
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    // Vérifier si l'utilisateur a évalué cette application
    const ratingIndex = app.ratings.findIndex(
      r => r.user.toString() === req.user.id
    );
    
    if (ratingIndex === -1) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }
    
    // Supprimer l'évaluation
    app.ratings.splice(ratingIndex, 1);
    
    // Enregistrer les modifications
    await app.save();
    
    res.json({ message: 'Évaluation supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'évaluation:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Incrémenter le compteur de téléchargements d'une application
 * @route   POST /api/apps/:id/download
 * @access  Public
 */
exports.incrementDownloads = async (req, res) => {
  try {
    // Vérifier si l'application existe
    const app = await App.findById(req.params.id);
    
    if (!app) {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    // Incrémenter le compteur de téléchargements
    app.downloads += 1;
    
    // Enregistrer les modifications
    await app.save();
    
    res.json({ downloads: app.downloads });
  } catch (err) {
    console.error('Erreur lors de l\'incrémentation des téléchargements:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Application non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Contrôleur des catégories
 * 
 * Ce contrôleur gère les fonctionnalités liées aux catégories d'applications :
 * liste, détails, création, mise à jour, suppression, etc.
 */

const Category = require('../models/Category');
const App = require('../models/App');
const { validationResult } = require('express-validator');

/**
 * @desc    Récupérer toutes les catégories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    // Paramètres de filtrage
    const filter = { isActive: true };
    
    // Filtrer par parent (catégories principales ou sous-catégories)
    if (req.query.parent === 'null') {
      filter.parent = null;
    } else if (req.query.parent) {
      filter.parent = req.query.parent;
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
      default:
        sort = { order: 1, name: 1 };
    }
    
    // Exécuter la requête
    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort(sort);
    
    // Ajouter le nombre d'applications pour chaque catégorie
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await App.countDocuments({
          category: category._id,
          isActive: true
        });
        
        return {
          ...category.toObject(),
          appsCount: count
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (err) {
    console.error('Erreur lors de la récupération des catégories:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Récupérer une catégorie par son ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Récupérer les sous-catégories
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true
    }).sort({ order: 1, name: 1 });
    
    // Récupérer le nombre d'applications
    const appsCount = await App.countDocuments({
      category: category._id,
      isActive: true
    });
    
    // Récupérer les applications de cette catégorie
    const apps = await App.find({
      category: category._id,
      isActive: true
    })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(10);
    
    res.json({
      ...category.toObject(),
      subcategories,
      appsCount,
      apps
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de la catégorie:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Récupérer une catégorie par son slug
 * @route   GET /api/categories/slug/:slug
 * @access  Public
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parent', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Récupérer les sous-catégories
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true
    }).sort({ order: 1, name: 1 });
    
    // Récupérer le nombre d'applications
    const appsCount = await App.countDocuments({
      category: category._id,
      isActive: true
    });
    
    // Récupérer les applications de cette catégorie
    const apps = await App.find({
      category: category._id,
      isActive: true
    })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(10);
    
    res.json({
      ...category.toObject(),
      subcategories,
      appsCount,
      apps
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de la catégorie:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Créer une nouvelle catégorie
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
exports.createCategory = async (req, res) => {
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
      icon,
      color,
      order,
      parent
    } = req.body;
    
    // Vérifier si le slug est déjà utilisé
    const slugExists = await Category.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'Ce slug est déjà utilisé' });
    }
    
    // Vérifier si la catégorie parente existe
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        return res.status(400).json({ message: 'Catégorie parente non trouvée' });
      }
    }
    
    // Créer une nouvelle catégorie
    const category = new Category({
      name,
      slug,
      description,
      icon,
      color,
      order,
      parent
    });
    
    // Enregistrer la catégorie dans la base de données
    const savedCategory = await category.save();
    
    res.status(201).json(savedCategory);
  } catch (err) {
    console.error('Erreur lors de la création de la catégorie:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Mettre à jour une catégorie
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
exports.updateCategory = async (req, res) => {
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
      icon,
      color,
      order,
      parent,
      isActive
    } = req.body;
    
    // Vérifier si la catégorie existe
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Vérifier si le slug est déjà utilisé par une autre catégorie
    if (slug && slug !== category.slug) {
      const slugExists = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (slugExists) {
        return res.status(400).json({ message: 'Ce slug est déjà utilisé' });
      }
    }
    
    // Vérifier si la catégorie parente existe
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        return res.status(400).json({ message: 'Catégorie parente non trouvée' });
      }
      
      // Vérifier que la catégorie ne devient pas sa propre parente ou grand-parente
      if (parent.toString() === req.params.id) {
        return res.status(400).json({ message: 'Une catégorie ne peut pas être sa propre parente' });
      }
      
      // Vérifier les parents récursivement pour éviter les cycles
      let currentParent = parent;
      while (currentParent) {
        const parentCategory = await Category.findById(currentParent);
        if (!parentCategory) break;
        
        if (parentCategory.parent && parentCategory.parent.toString() === req.params.id) {
          return res.status(400).json({ message: 'Création d\'un cycle de parenté détectée' });
        }
        
        currentParent = parentCategory.parent;
      }
    }
    
    // Mettre à jour la catégorie
    category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name || category.name,
        slug: slug || category.slug,
        description: description || category.description,
        icon: icon || category.icon,
        color: color || category.color,
        order: order !== undefined ? order : category.order,
        parent: parent !== undefined ? parent : category.parent,
        isActive: isActive !== undefined ? isActive : category.isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.json(category);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la catégorie:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Supprimer une catégorie
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
exports.deleteCategory = async (req, res) => {
  try {
    // Vérifier si la catégorie existe
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Vérifier si des applications utilisent cette catégorie
    const appsCount = await App.countDocuments({ category: req.params.id });
    
    if (appsCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette catégorie car elle est utilisée par ${appsCount} application(s)`
      });
    }
    
    // Vérifier si des sous-catégories utilisent cette catégorie comme parent
    const subcategoriesCount = await Category.countDocuments({ parent: req.params.id });
    
    if (subcategoriesCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette catégorie car elle est parente de ${subcategoriesCount} sous-catégorie(s)`
      });
    }
    
    // Supprimer la catégorie
    await category.remove();
    
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la catégorie:', err);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Contrôleur pour les paramètres de l'application
 * 
 * Ce contrôleur gère les opérations CRUD pour les paramètres de l'application.
 * Il permet de récupérer, mettre à jour et réinitialiser les paramètres.
 * 
 * @module controllers/settings
 * @author Marketplace Team
 * @version 1.0.0
 */

const Setting = require('../models/Setting');

/**
 * Récupère tous les paramètres de l'application
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Paramètres de l'application
 */
exports.getSettings = async (req, res) => {
  try {
    // Récupérer tous les paramètres sous forme d'objet
    const settings = await Setting.getAllAsObject();
    
    // Si aucun paramètre n'est trouvé, initialiser avec les valeurs par défaut
    if (Object.keys(settings).length === 0) {
      return res.json(await Setting.resetToDefaults());
    }
    
    return res.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des paramètres',
      error: error.message
    });
  }
};

/**
 * Met à jour les paramètres de l'application
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Paramètres mis à jour
 */
exports.updateSettings = async (req, res) => {
  try {
    // Vérifier si le corps de la requête est vide
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: 'Le corps de la requête ne peut pas être vide'
      });
    }
    
    // Mettre à jour les paramètres
    const updatedSettings = await Setting.updateMultiple(req.body);
    
    return res.json(updatedSettings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour des paramètres',
      error: error.message
    });
  }
};

/**
 * Réinitialise les paramètres de l'application aux valeurs par défaut
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Paramètres réinitialisés
 */
exports.resetSettings = async (req, res) => {
  try {
    // Réinitialiser les paramètres
    const defaultSettings = await Setting.resetToDefaults();
    
    return res.json(defaultSettings);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error);
    return res.status(500).json({
      message: 'Erreur lors de la réinitialisation des paramètres',
      error: error.message
    });
  }
};

/**
 * Récupère un paramètre spécifique par sa clé
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Paramètre spécifique
 */
exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    // Récupérer le paramètre par sa clé
    const setting = await Setting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({
        message: `Paramètre avec la clé '${key}' non trouvé`
      });
    }
    
    return res.json({ [key]: setting.value });
  } catch (error) {
    console.error(`Erreur lors de la récupération du paramètre '${req.params.key}':`, error);
    return res.status(500).json({
      message: `Erreur lors de la récupération du paramètre '${req.params.key}'`,
      error: error.message
    });
  }
};

/**
 * Met à jour un paramètre spécifique par sa clé
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Paramètre mis à jour
 */
exports.updateSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    // Vérifier si la valeur est fournie
    if (value === undefined) {
      return res.status(400).json({
        message: 'La valeur du paramètre est requise'
      });
    }
    
    // Mettre à jour le paramètre
    const setting = await Setting.findOneAndUpdate(
      { key },
      { $set: { value } },
      { new: true, upsert: true }
    );
    
    return res.json({ [key]: setting.value });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du paramètre '${req.params.key}':`, error);
    return res.status(500).json({
      message: `Erreur lors de la mise à jour du paramètre '${req.params.key}'`,
      error: error.message
    });
  }
};

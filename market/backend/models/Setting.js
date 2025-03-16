/**
 * Modèle pour les paramètres de l'application
 * 
 * Ce modèle stocke les paramètres globaux de l'application.
 * Il utilise un schéma avec un champ 'key' unique pour identifier chaque paramètre.
 * 
 * @module models/Setting
 * @author Marketplace Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Schéma pour les paramètres
 * @type {mongoose.Schema}
 */
const SettingSchema = new mongoose.Schema({
  // Clé unique du paramètre
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Valeur du paramètre (peut être de n'importe quel type)
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Description du paramètre
  description: {
    type: String,
    trim: true
  },
  
  // Type de paramètre (string, number, boolean, object, array)
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string'
  },
  
  // Indique si le paramètre est modifiable via l'interface d'administration
  isEditable: {
    type: Boolean,
    default: true
  },
  
  // Indique si le paramètre est visible dans l'interface d'administration
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Groupe de paramètres (pour l'organisation dans l'interface)
  group: {
    type: String,
    default: 'general',
    enum: ['general', 'api', 'features', 'analytics', 'security']
  }
}, {
  timestamps: true
});

/**
 * Méthode statique pour récupérer tous les paramètres sous forme d'objet
 * @returns {Promise<Object>} Objet contenant tous les paramètres
 */
SettingSchema.statics.getAllAsObject = async function() {
  const settings = await this.find({ isVisible: true });
  const result = {};
  
  settings.forEach(setting => {
    result[setting.key] = setting.value;
  });
  
  return result;
};

/**
 * Méthode statique pour mettre à jour plusieurs paramètres à la fois
 * @param {Object} settingsObject - Objet contenant les paramètres à mettre à jour
 * @returns {Promise<Object>} Objet contenant tous les paramètres mis à jour
 */
SettingSchema.statics.updateMultiple = async function(settingsObject) {
  const updates = [];
  
  // Préparer les opérations de mise à jour
  for (const [key, value] of Object.entries(settingsObject)) {
    updates.push({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true
      }
    });
  }
  
  // Exécuter les opérations en une seule requête
  if (updates.length > 0) {
    await this.bulkWrite(updates);
  }
  
  // Retourner tous les paramètres mis à jour
  return this.getAllAsObject();
};

/**
 * Méthode statique pour réinitialiser les paramètres aux valeurs par défaut
 * @returns {Promise<Object>} Objet contenant tous les paramètres réinitialisés
 */
SettingSchema.statics.resetToDefaults = async function() {
  // Définir les paramètres par défaut
  const defaultSettings = {
    siteName: 'Marketplace Web',
    siteDescription: 'Découvrez des applications web innovantes',
    contactEmail: 'contact@marketplace.example.com',
    apiKey: '••••••••••••••••',
    enableRegistration: true,
    enableNotifications: true,
    maintenanceMode: false,
    analyticsId: 'UA-XXXXXXXXX-X',
    enableAnalytics: true,
    collectUserData: true,
    showStatsToUsers: false,
    dataRetentionPeriod: 365
  };
  
  // Mettre à jour tous les paramètres avec les valeurs par défaut
  return this.updateMultiple(defaultSettings);
};

// Créer et exporter le modèle
const Setting = mongoose.model('Setting', SettingSchema);
module.exports = Setting;

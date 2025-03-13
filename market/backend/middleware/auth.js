/**
 * Middleware d'authentification
 * 
 * Ce middleware vérifie la présence et la validité du token JWT dans les en-têtes de la requête.
 * Il est utilisé pour protéger les routes qui nécessitent une authentification.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier l'authentification de l'utilisateur
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next Express
 */
const auth = (req, res, next) => {
  try {
    // Récupérer le token depuis les en-têtes
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = decoded;
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré. Veuillez vous reconnecter.' });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide. Veuillez vous reconnecter.' });
    }
    
    console.error('Erreur d\'authentification:', err);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'authentification.' });
  }
};

/**
 * Middleware pour vérifier les droits d'administrateur
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {Function} next - Fonction next Express
 */
const admin = (req, res, next) => {
  // Le middleware auth doit être exécuté avant
  if (!req.user) {
    return res.status(401).json({ message: 'Accès non autorisé. Authentification requise.' });
  }
  
  // Vérifier si l'utilisateur est un administrateur
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit. Droits d\'administrateur requis.' });
  }
  
  next();
};

module.exports = { auth, admin };

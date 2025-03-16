#!/bin/bash

# Script post-pull pour Transkryptor
# Ce script applique les modifications nécessaires après chaque git pull de Transkryptor
# Exécuter ce script après chaque mise à jour de Transkryptor

# Chemin vers le répertoire de Transkryptor
TRANSKRYPTOR_DIR="apps/transkryptor"

echo "Mise à jour de Transkryptor pour l'intégration avec la marketplace..."

# 1. Création des fichiers d'override s'ils n'existent pas
echo "Création des fichiers d'override..."

# Fichier CSS d'override
if [ ! -f "$TRANSKRYPTOR_DIR/public/css/marketplace-overrides.css" ]; then
  cat > "$TRANSKRYPTOR_DIR/public/css/marketplace-overrides.css" << 'EOF'
/**
 * Styles d'override pour l'intégration de Transkryptor avec la marketplace
 * Ces styles corrigent les problèmes de compatibilité avec la marketplace
 */

/* Correction pour le body */
body {
  overflow: auto !important; /* Permettre le défilement */
  height: auto !important; /* Hauteur automatique */
  padding: 0 !important; /* Pas de padding */
  margin: 0 !important; /* Pas de marge */
}

/* Correction pour les champs de saisie password */
input[type="password"] {
  color: var(--text-primary) !important;
  background-color: var(--bg-primary) !important;
  border: 1px solid var(--text-light) !important;
  padding: var(--spacing-sm) var(--spacing-md) !important;
  border-radius: var(--border-radius-md) !important;
  font-size: var(--font-size-md) !important;
  width: 100% !important;
  display: block !important;
  margin: 8px 0 !important;
}

/* Correction pour les champs de sélection de fichier */
input[type="file"] {
  color: #000000 !important; /* Texte noir pour un contraste maximal */
}

/* Correction pour le texte qui affiche le nom du fichier sélectionné */
.file-name, 
.file-label, 
.file-info, 
.selected-file,
input[type="file"]::file-selector-button {
  color: #000000 !important; /* Texte noir pour un contraste maximal */
}

/* Correction pour le conteneur principal */
.main-container {
  height: auto !important;
  min-height: 100vh !important;
  overflow: visible !important;
  padding: 20px !important;
  max-width: 100% !important;
  width: 100% !important;
}

/* Correction pour les blocs */
.block {
  margin-bottom: 20px !important;
  overflow: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* Correction pour les cartes et conteneurs */
.card, .container, .section, .panel {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Correction pour les boutons */
button, .button, .btn {
  padding: 10px 20px !important;
  margin: 5px !important;
  min-width: 120px !important;
  font-size: 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1.5 !important;
  height: 40px !important;
}

/* Groupe de boutons */
.button-group, .btn-group, .actions {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 10px !important;
  margin: 15px 0 !important;
  width: 100% !important;
}

/* Assurer que le texte est centré dans tous les éléments interactifs */
input[type="button"], 
input[type="submit"], 
input[type="reset"],
a.button,
a.btn,
label.button,
label.btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  line-height: 1.5 !important;
  height: 40px !important;
}

/* Correction pour les zones de défilement */
#rawTranscription, #analyzeResult, #synthesisResult, #debug {
  max-height: 300px !important;
  overflow-y: auto !important;
  color: #000000 !important; /* Texte noir pour un contraste maximal */
  font-family: 'Roboto Mono', monospace !important;
  line-height: 1.5 !important;
}

/* Redéfinition complète des barres de progression */
.progress-container {
  width: 100% !important;
  height: 24px !important;
  background-color: #e9ecef !important;
  border-radius: 4px !important;
  margin: 10px 0 20px 0 !important;
  overflow: hidden !important;
  position: relative !important;
  display: block !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.progress-bar {
  height: 100% !important;
  background-color: #6c7ae0 !important;
  border-radius: 4px !important;
  transition: width 0.3s ease !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  display: block !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.progress-text {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  color: #000000 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.7) !important;
  z-index: 10 !important;
  width: auto !important;
  white-space: nowrap !important;
}

/* Styles spécifiques pour les différents types de progression */
#globalProgress, #batchProgress {
  width: 100% !important;
  margin-bottom: 20px !important;
  display: block !important;
}

#globalProgress .progress-container,
#batchProgress .progress-container {
  width: 100% !important;
  height: 24px !important;
  display: block !important;
}

#globalProgress .progress-bar,
#batchProgress .progress-bar {
  height: 100% !important;
  display: block !important;
}

/* Correction pour les éléments de progression spécifiques */
.progress-wrapper, .progress-outer, .progress-inner {
  width: 100% !important;
  display: block !important;
  position: relative !important;
}

/* Assurer que le texte de progression est visible */
.progress-label, .progress-value, .progress-percentage {
  color: #000000 !important;
  font-weight: 600 !important;
  margin-bottom: 5px !important;
  display: block !important;
}

/* Amélioration de la lisibilité des logs */
#debug {
  color: #000000 !important; /* Texte noir pour un contraste maximal */
  font-family: 'Roboto Mono', monospace !important;
  font-size: var(--font-size-sm) !important;
  white-space: pre-wrap !important;
}

/* Amélioration de la lisibilité des contenus textuels */
#rawTranscription, #analyzeResult, #synthesisResult {
  color: #000000 !important; /* Texte noir pour un contraste maximal */
  font-size: var(--font-size-sm) !important;
  line-height: 1.6 !important;
  white-space: pre-wrap !important;
}

/* Ajout d'un titre h1 caché pour éviter l'erreur JavaScript */
h1.hidden-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
EOF
  echo "Fichier CSS d'override créé."
else
  echo "Le fichier CSS d'override existe déjà."
fi

# Fichier JavaScript d'override
if [ ! -f "$TRANSKRYPTOR_DIR/public/js/marketplace-overrides.js" ]; then
  cat > "$TRANSKRYPTOR_DIR/public/js/marketplace-overrides.js" << 'EOF'
/**
 * Script d'override pour l'intégration de Transkryptor avec la marketplace
 * Ce script corrige les problèmes de compatibilité avec la marketplace
 */

// Fonction pour corriger l'erreur h1 manquant
function fixMissingH1() {
  if (!document.querySelector('h1')) {
    console.log('Ajout d\'un élément h1 caché pour éviter l\'erreur JavaScript');
    const h1 = document.createElement('h1');
    h1.className = 'hidden-title';
    h1.textContent = 'Transkryptor';
    document.body.prepend(h1);
  }
}

// Fonction pour ajouter des boutons de visibilité aux champs password
function addPasswordToggle() {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  
  passwordFields.forEach((field, index) => {
    // Créer un conteneur pour le champ et le bouton
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    
    // Remplacer le champ par le conteneur
    field.parentNode.insertBefore(container, field);
    container.appendChild(field);
    
    // Créer le bouton de visibilité
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.innerHTML = '👁️';
    toggleButton.style.position = 'absolute';
    toggleButton.style.right = '10px';
    toggleButton.style.top = '50%';
    toggleButton.style.transform = 'translateY(-50%)';
    toggleButton.style.background = 'transparent';
    toggleButton.style.border = 'none';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.padding = '0';
    toggleButton.style.color = 'var(--text-secondary)';
    toggleButton.style.zIndex = '10';
    toggleButton.title = 'Afficher/masquer le mot de passe';
    
    // Ajouter le bouton au conteneur
    container.appendChild(toggleButton);
    
    // Ajouter l'événement de clic
    toggleButton.addEventListener('click', () => {
      if (field.type === 'password') {
        field.type = 'text';
        toggleButton.innerHTML = '🔒';
      } else {
        field.type = 'password';
        toggleButton.innerHTML = '👁️';
      }
    });
  });
}

// Exécuter les corrections au chargement du document
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initialisation des overrides pour Transkryptor');
  
  // Corriger l'erreur h1 manquant
  fixMissingH1();
  
  // Ajouter des boutons de visibilité aux champs password
  addPasswordToggle();
  
  // Corriger la fonction updateVersion
  if (window.updateVersion) {
    const originalUpdateVersion = window.updateVersion;
    window.updateVersion = function() {
      try {
        originalUpdateVersion();
      } catch (error) {
        console.warn('Erreur interceptée dans updateVersion:', error);
      }
    };
  }
});
EOF
  echo "Fichier JavaScript d'override créé."
else
  echo "Le fichier JavaScript d'override existe déjà."
fi

# 2. Modification du fichier HTML pour inclure les fichiers d'override
echo "Modification du fichier HTML..."

# Vérifier si les fichiers d'override sont déjà inclus
if ! grep -q "marketplace-overrides.css" "$TRANSKRYPTOR_DIR/public/index.html"; then
  # Ajouter les fichiers d'override à la fin de head
  # Utiliser une syntaxe compatible avec BSD sed (macOS) et GNU sed (Linux)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' '/<\/head>/i \
    <!-- Styles d'"'"'override pour la marketplace -->\
    <link rel="stylesheet" href="css/marketplace-overrides.css">' "$TRANSKRYPTOR_DIR/public/index.html"
  else
    # Linux (GNU sed)
    sed -i '/<\/head>/i \    <!-- Styles d'"'"'override pour la marketplace -->\n    <link rel="stylesheet" href="css\/marketplace-overrides.css">' "$TRANSKRYPTOR_DIR/public/index.html"
  fi
  echo "Fichier CSS d'override ajouté au HTML."
else
  echo "Le fichier CSS d'override est déjà inclus dans le HTML."
fi

if ! grep -q "marketplace-overrides.js" "$TRANSKRYPTOR_DIR/public/index.html"; then
  # Ajouter les fichiers d'override à la fin de body
  # Utiliser une syntaxe compatible avec BSD sed (macOS) et GNU sed (Linux)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' '/<\/body>/i \
    <!-- Script d'"'"'override pour la marketplace -->\
    <script src="js/marketplace-overrides.js"></script>' "$TRANSKRYPTOR_DIR/public/index.html"
  else
    # Linux (GNU sed)
    sed -i '/<\/body>/i \    <!-- Script d'"'"'override pour la marketplace -->\n    <script src="js\/marketplace-overrides.js"><\/script>' "$TRANSKRYPTOR_DIR/public/index.html"
  fi
  echo "Fichier JavaScript d'override ajouté au HTML."
else
  echo "Le fichier JavaScript d'override est déjà inclus dans le HTML."
fi

# 3. Correction directe de certains fichiers
echo "Application des corrections directes..."

# Correction de getConfig dans config.js pour les URLs des endpoints
if grep -q "const API_URL = window.location.origin;" "$TRANSKRYPTOR_DIR/public/js/config.js" && ! grep -q "isInMarketplace" "$TRANSKRYPTOR_DIR/public/js/config.js"; then
  # Créer un fichier temporaire avec la correction
  cat > /tmp/config.js.endpoints.fix << 'EOF'
export function getConfig() {
    // Calculer l'URL de l'API au moment de l'appel
    const API_URL = window.location.origin;
    
    // Déterminer si nous sommes dans la marketplace ou en mode standalone
    const isInMarketplace = window.location.pathname.includes('/transkryptor');
    
    // Construire les URLs des endpoints en fonction du contexte
    const apiPrefix = isInMarketplace ? '/transkryptor/api' : '';
    
    return {
        ...CONFIG,
        apiEndpoints: {
            testKeys: `${API_URL}${apiPrefix}/test-keys`,
            analyze: `${API_URL}${apiPrefix}/analyze`
        }
    };
}
EOF

  # Appliquer la correction
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' -e '/export function getConfig/,/^}/c\
'"$(cat /tmp/config.js.endpoints.fix)" "$TRANSKRYPTOR_DIR/public/js/config.js"
  else
    # Linux (GNU sed)
    sed -i -e '/export function getConfig/,/^}/c\
'"$(cat /tmp/config.js.endpoints.fix)" "$TRANSKRYPTOR_DIR/public/js/config.js"
  fi
  
  # Nettoyer le fichier temporaire
  rm /tmp/config.js.endpoints.fix
  
  echo "Correction des URLs des endpoints appliquée à config.js."
else
  echo "La correction des URLs des endpoints n'est pas nécessaire ou a déjà été appliquée."
fi

# Correction de config.js pour éviter l'erreur h1 manquant
if grep -q "document.querySelector('h1').textContent" "$TRANSKRYPTOR_DIR/public/js/config.js"; then
  # Créer un fichier temporaire avec la correction
  cat > /tmp/config.js.fix << 'EOF'
    const h1Element = document.querySelector('h1');
    if (h1Element) {
        h1Element.textContent = `Transkryptor v${config.version} - (c) Christophe Lesur - Cloud Temple - 2025`;
    }
EOF

  # Appliquer la correction
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' -e "/document.querySelector('h1').textContent/r /tmp/config.js.fix" -e "/document.querySelector('h1').textContent/d" "$TRANSKRYPTOR_DIR/public/js/config.js"
  else
    # Linux (GNU sed)
    sed -i -e "/document.querySelector('h1').textContent/r /tmp/config.js.fix" -e "/document.querySelector('h1').textContent/d" "$TRANSKRYPTOR_DIR/public/js/config.js"
  fi
  
  # Nettoyer le fichier temporaire
  rm /tmp/config.js.fix
  
  echo "Correction appliquée à config.js."
else
  echo "La correction pour config.js n'est pas nécessaire ou a déjà été appliquée."
fi

# Correction de base.css pour supprimer overflow: hidden
if grep -q "overflow: hidden;" "$TRANSKRYPTOR_DIR/public/css/base.css"; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' "s/overflow: hidden;/overflow: auto;/g" "$TRANSKRYPTOR_DIR/public/css/base.css"
  else
    # Linux (GNU sed)
    sed -i "s/overflow: hidden;/overflow: auto;/g" "$TRANSKRYPTOR_DIR/public/css/base.css"
  fi
  echo "Correction appliquée à base.css."
else
  echo "La correction pour base.css n'est pas nécessaire ou a déjà été appliquée."
fi

# Correction de transcriptionUtils.js pour rediriger les requêtes de transcription vers le serveur
if grep -q "https://api.openai.com/v1/audio/transcriptions" "$TRANSKRYPTOR_DIR/public/js/utils/transcriptionUtils.js"; then
  # Créer un fichier temporaire avec la correction
  cat > /tmp/transcriptionUtils.js.fix << 'EOF'
export async function transcribeChunk(chunkBlob, apiKey, chunkIndex, batchIndex, timeout) {
    const formData = new FormData();
    formData.append("file", chunkBlob, `chunk_${chunkIndex}.wav`);
    formData.append("model", "whisper-1");
    formData.append("openaiKey", apiKey); // Envoyer la clé API au serveur

    try {
        log(`Traitement du morceau ${chunkIndex + 1} commencé`);
        
        // Déterminer si nous sommes dans la marketplace ou en mode standalone
        const isInMarketplace = window.location.pathname.includes('/transkryptor');
        
        // Construire l'URL de l'endpoint en fonction du contexte
        const apiPrefix = isInMarketplace ? '/transkryptor/api' : '';
        const API_URL = window.location.origin;
        const transcriptionEndpoint = `${API_URL}${apiPrefix}/transcribe`;
        
        const response = await axios.post(transcriptionEndpoint, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            timeout: timeout,
        });
        
        log(`Traitement du morceau ${chunkIndex + 1} terminé`);
        return response.data.text;
    } catch (error) {
        log(`Erreur lors de la transcription du morceau ${chunkIndex + 1}: ${error.message}`);
        throw error;
    }
}
EOF

  # Appliquer la correction
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' -e '/export async function transcribeChunk/,/^}/c\
'"$(cat /tmp/transcriptionUtils.js.fix)" "$TRANSKRYPTOR_DIR/public/js/utils/transcriptionUtils.js"
  else
    # Linux (GNU sed)
    sed -i -e '/export async function transcribeChunk/,/^}/c\
'"$(cat /tmp/transcriptionUtils.js.fix)" "$TRANSKRYPTOR_DIR/public/js/utils/transcriptionUtils.js"
  fi
  
  # Nettoyer le fichier temporaire
  rm /tmp/transcriptionUtils.js.fix
  
  echo "Correction appliquée à transcriptionUtils.js."
else
  echo "La correction pour transcriptionUtils.js n'est pas nécessaire ou a déjà été appliquée."
fi

# Ajout de la route /transcribe au serveur.js
if ! grep -q "app.post('/transcribe'" "$TRANSKRYPTOR_DIR/server.js"; then
  # Vérifier si multer est déjà importé
  if ! grep -q "const multer = require('multer');" "$TRANSKRYPTOR_DIR/server.js"; then
    # Ajouter l'import de multer après les autres imports
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS (BSD sed)
      sed -i '' '/app.use.*express.static/a\
\
// Middleware pour gérer les fichiers multipart/form-data\
const multer = require('\''multer'\'');\
const storage = multer.memoryStorage();\
const upload = multer({ \
  storage: storage,\
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size\
});' "$TRANSKRYPTOR_DIR/server.js"
    else
      # Linux (GNU sed)
      sed -i '/app.use.*express.static/a\\\n// Middleware pour gérer les fichiers multipart/form-data\nconst multer = require('\''multer'\'');\nconst storage = multer.memoryStorage();\nconst upload = multer({ \n  storage: storage,\n  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size\n});' "$TRANSKRYPTOR_DIR/server.js"
    fi
  fi
  
  # Créer un fichier temporaire avec la route /transcribe
  cat > /tmp/server.js.transcribe.fix << 'EOF'

// Importer la bibliothèque form-data
const FormData = require('form-data');

// Nouvelle route pour la transcription audio
app.post('/transcribe', upload.single('file'), async (req, res) => {
    Logger.startSection('Transcription audio');
    try {
        // Récupérer la clé API et le modèle depuis le corps de la requête
        const openaiKey = req.body.openaiKey;
        const model = req.body.model || 'whisper-1';
        
        Logger.debug({
            hasOpenaiKey: !!openaiKey,
            model,
            hasFile: !!req.file,
            bodyKeys: Object.keys(req.body),
            fileInfo: req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : null
        }, 'Paramètres reçus pour la transcription');
        
        // Vérifier que la clé API est fournie
        if (!openaiKey) {
            Logger.error('Clé API OpenAI manquante');
            return res.status(400).json({ error: 'Clé API OpenAI requise' });
        }
        
        // Vérifier que le fichier est fourni
        if (!req.file) {
            Logger.error('Fichier audio manquant');
            return res.status(400).json({ error: 'Fichier audio requis' });
        }
        
        Logger.info(`Transcription du fichier ${req.file.originalname} commencée`);
        
        // Créer un FormData manuellement
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
        const headers = {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
        };
        
        // Construire le corps de la requête manuellement
        let body = '';
        
        // Ajouter le modèle
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="model"\r\n\r\n';
        body += `${model}\r\n`;
        
        // Ajouter le fichier
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="${req.file.originalname}"\r\n`;
        body += `Content-Type: ${req.file.mimetype}\r\n\r\n`;
        
        // Convertir le corps en Buffer
        const bodyStart = Buffer.from(body, 'utf8');
        const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
        
        // Concaténer les buffers
        const requestBody = Buffer.concat([
            bodyStart,
            req.file.buffer,
            bodyEnd
        ]);
        
        // Appeler l'API OpenAI directement avec le buffer
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', requestBody, {
            headers: headers,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        Logger.success('Transcription terminée avec succès');
        res.json(response.data);
    } catch (error) {
        Logger.error('Erreur lors de la transcription', error);
        
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
    Logger.endSection('Transcription audio');
});
EOF

  # Ajouter la route /transcribe avant la route pour servir index.html
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' '/app.get.*\//i\
'"$(cat /tmp/server.js.transcribe.fix)" "$TRANSKRYPTOR_DIR/server.js"
  else
    # Linux (GNU sed)
    sed -i '/app.get.*\//i\
'"$(cat /tmp/server.js.transcribe.fix)" "$TRANSKRYPTOR_DIR/server.js"
  fi
  
  # Nettoyer le fichier temporaire
  rm /tmp/server.js.transcribe.fix
  
  echo "Route /transcribe ajoutée à server.js."
else
  echo "La route /transcribe existe déjà dans server.js."
fi

echo "Mise à jour de Transkryptor terminée."

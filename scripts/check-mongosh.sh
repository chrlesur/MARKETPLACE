#!/bin/bash

# Script pour vérifier l'état de MongoDB et installer MongoDB Shell (mongosh) sur le serveur distant

# Configuration
SERVER="market@market.quantum-dream.net"
PORT="4022"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher un message d'information
info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Fonction pour afficher un message de succès
success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Fonction pour afficher un message d'erreur
error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour afficher un message d'avertissement
warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Se connecter au serveur distant et exécuter les vérifications
info "Connexion au serveur distant $SERVER..."
ssh -p "$PORT" "$SERVER" << 'EOF'
  echo "=== Vérification de MongoDB Shell (mongosh) ==="
  
  # Vérifier si mongosh est installé
  if command -v mongosh &> /dev/null; then
    echo "MongoDB Shell (mongosh) est installé."
    mongosh --version
  else
    echo "MongoDB Shell (mongosh) n'est pas installé."
    echo "Installation de MongoDB Shell (mongosh)..."
    
    # Déterminer la distribution Linux
    if [ -f /etc/redhat-release ]; then
      echo "Distribution Red Hat détectée."
      
      # Créer le fichier de dépôt MongoDB
      sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOT'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOT
      
      # Installer MongoDB Shell
      sudo dnf install -y mongodb-mongosh
      
      if command -v mongosh &> /dev/null; then
        echo "MongoDB Shell (mongosh) a été installé avec succès."
        mongosh --version
      else
        echo "Échec de l'installation de MongoDB Shell (mongosh)."
      fi
    elif [ -f /etc/debian_version ]; then
      echo "Distribution Debian/Ubuntu détectée."
      
      # Installer les dépendances
      sudo apt-get update
      sudo apt-get install -y gnupg curl
      
      # Ajouter la clé GPG MongoDB
      curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
        --dearmor
      
      # Créer le fichier de dépôt MongoDB
      echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
      
      # Installer MongoDB Shell
      sudo apt-get update
      sudo apt-get install -y mongodb-mongosh
      
      if command -v mongosh &> /dev/null; then
        echo "MongoDB Shell (mongosh) a été installé avec succès."
        mongosh --version
      else
        echo "Échec de l'installation de MongoDB Shell (mongosh)."
      fi
    else
      echo "Distribution Linux non prise en charge."
    fi
  fi
  
  # Vérifier si MongoDB est en cours d'exécution
  echo -e "\n=== Vérification de MongoDB ==="
  if pgrep mongod > /dev/null; then
    echo "MongoDB est en cours d'exécution."
    
    # Vérifier si MongoDB est accessible
    echo -e "\n=== Test de connexion à MongoDB ==="
    if command -v mongosh &> /dev/null; then
      echo "Test de connexion avec mongosh..."
      mongosh --eval 'db.runCommand({ ping: 1 })' --quiet
      if [ $? -eq 0 ]; then
        echo "MongoDB est accessible."
      else
        echo "MongoDB n'est pas accessible."
        
        # Vérifier la configuration de MongoDB
        echo -e "\n=== Vérification de la configuration de MongoDB ==="
        if [ -f /etc/mongod.conf ]; then
          echo "Fichier de configuration trouvé: /etc/mongod.conf"
          echo "Adresse d'écoute configurée:"
          grep -A 5 "net:" /etc/mongod.conf
          
          # Modifier la configuration pour utiliser 127.0.0.1 au lieu de localhost
          echo -e "\n=== Modification de la configuration de MongoDB ==="
          echo "Modification de la configuration pour utiliser 127.0.0.1 au lieu de localhost..."
          sudo sed -i 's/bindIp: localhost/bindIp: 127.0.0.1/g' /etc/mongod.conf
          
          # Redémarrer MongoDB
          echo -e "\n=== Redémarrage de MongoDB ==="
          sudo systemctl restart mongod
          
          # Vérifier à nouveau si MongoDB est accessible
          echo -e "\n=== Test de connexion à MongoDB après redémarrage ==="
          mongosh --eval 'db.runCommand({ ping: 1 })' --quiet
          if [ $? -eq 0 ]; then
            echo "MongoDB est maintenant accessible."
          else
            echo "MongoDB n'est toujours pas accessible."
          fi
        else
          echo "Fichier de configuration non trouvé."
        fi
      fi
    else
      echo "MongoDB Shell (mongosh) n'est pas installé, impossible de tester la connexion."
    fi
  else
    echo "MongoDB n'est pas en cours d'exécution."
    
    # Démarrer MongoDB
    echo -e "\n=== Démarrage de MongoDB ==="
    sudo systemctl start mongod
    
    # Vérifier si MongoDB est maintenant en cours d'exécution
    if pgrep mongod > /dev/null; then
      echo "MongoDB a été démarré avec succès."
      
      # Vérifier si MongoDB est accessible
      echo -e "\n=== Test de connexion à MongoDB ==="
      if command -v mongosh &> /dev/null; then
        echo "Test de connexion avec mongosh..."
        mongosh --eval 'db.runCommand({ ping: 1 })' --quiet
        if [ $? -eq 0 ]; then
          echo "MongoDB est accessible."
        else
          echo "MongoDB n'est pas accessible."
        fi
      else
        echo "MongoDB Shell (mongosh) n'est pas installé, impossible de tester la connexion."
      fi
    else
      echo "Échec du démarrage de MongoDB."
    fi
  fi
  
  echo -e "\n=== Fin de la vérification ==="
EOF

info "Vérification terminée."

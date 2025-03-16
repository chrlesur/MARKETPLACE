#!/bin/bash

# Script de diagnostic pour vérifier l'état de MongoDB sur le serveur distant

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
  echo "=== Diagnostic MongoDB ==="
  
  # Vérifier si MongoDB est installé
  echo -e "\n[1] Vérification de l'installation de MongoDB..."
  if command -v mongod &> /dev/null; then
    echo "MongoDB est installé."
    mongod --version | head -n 1
  else
    echo "MongoDB n'est pas installé."
    echo "Tentative d'installation de MongoDB..."
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    if [ $? -eq 0 ]; then
      echo "MongoDB a été installé avec succès."
      mongod --version | head -n 1
    else
      echo "Échec de l'installation de MongoDB."
    fi
  fi
  
  # Vérifier si le service MongoDB est en cours d'exécution
  echo -e "\n[2] Vérification du service MongoDB..."
  if sudo systemctl is-active --quiet mongod 2>/dev/null; then
    echo "Le service MongoDB est actif."
  elif sudo service mongod status &>/dev/null; then
    echo "Le service MongoDB est actif (via service)."
  else
    echo "Le service MongoDB n'est pas actif."
    
    # Vérifier si le processus mongod est en cours d'exécution
    if pgrep mongod > /dev/null; then
      echo "Le processus mongod est en cours d'exécution."
    else
      echo "Le processus mongod n'est pas en cours d'exécution."
      echo "Tentative de démarrage du service MongoDB..."
      sudo systemctl start mongod 2>/dev/null || sudo service mongod start 2>/dev/null
      if [ $? -eq 0 ]; then
        echo "Le service MongoDB a été démarré avec succès."
        sudo systemctl enable mongod 2>/dev/null || sudo update-rc.d mongod defaults 2>/dev/null
        echo "Le service MongoDB a été configuré pour démarrer automatiquement."
      else
        echo "Échec du démarrage du service MongoDB."
      fi
    fi
  fi
  
  # Vérifier la configuration de MongoDB
  echo -e "\n[3] Vérification de la configuration de MongoDB..."
  if [ -f /etc/mongod.conf ]; then
    echo "Fichier de configuration trouvé: /etc/mongod.conf"
    echo "Adresse d'écoute configurée:"
    grep -A 5 "net:" /etc/mongod.conf
  else
    echo "Fichier de configuration non trouvé."
  fi
  
  # Vérifier si MongoDB est accessible
  echo -e "\n[4] Test de connexion à MongoDB..."
  timeout 5 mongo --quiet --eval "db.runCommand({ ping: 1 })" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "MongoDB est accessible."
  else
    echo "MongoDB n'est pas accessible."
    
    # Vérifier les ports ouverts
    echo -e "\n[5] Vérification des ports ouverts..."
    if command -v netstat &> /dev/null; then
      echo "Ports MongoDB (27017):"
      netstat -tuln | grep 27017
    elif command -v ss &> /dev/null; then
      echo "Ports MongoDB (27017):"
      ss -tuln | grep 27017
    else
      echo "Commandes netstat et ss non disponibles."
    fi
  fi
  
  # Vérifier les logs MongoDB
  echo -e "\n[6] Dernières lignes des logs MongoDB..."
  if [ -f /var/log/mongodb/mongod.log ]; then
    tail -n 20 /var/log/mongodb/mongod.log
  else
    echo "Fichier de log non trouvé."
    find /var/log -name "*mongo*" 2>/dev/null
  fi
  
  echo -e "\n=== Fin du diagnostic ==="
EOF

info "Diagnostic terminé."
echo ""
echo "Basé sur les résultats ci-dessus, vous devrez peut-être:"
echo "1. Installer MongoDB si ce n'est pas déjà fait: sudo apt install -y mongodb-org"
echo "2. Démarrer le service MongoDB: sudo systemctl start mongod"
echo "3. Activer le démarrage automatique: sudo systemctl enable mongod"
echo "4. Vérifier la configuration dans /etc/mongod.conf"
echo "5. Vérifier les logs pour plus de détails"

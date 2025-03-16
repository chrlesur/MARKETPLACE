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

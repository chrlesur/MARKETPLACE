/**
 * Composant de navigation partagé pour les applications tierces
 * Ce composant permet d'ajouter une barre de navigation cohérente avec la marketplace
 * 
 * @module apps/shared/navbar
 * @author Marketplace Team
 * @version 1.0.0
 */

import { getUserInfo, isAuthenticated, logout } from './auth.js';

/**
 * Crée une barre de navigation pour les applications tierces
 * @param {Object} options - Options de configuration
 * @param {string} options.appName - Nom de l'application
 * @param {string} options.appIcon - Icône de l'application (optionnel)
 * @param {Array} options.menuItems - Éléments du menu (optionnel)
 * @param {string} options.containerId - ID du conteneur où insérer la navbar (optionnel, par défaut 'navbar-container')
 * @param {boolean} options.showHomeLink - Afficher le lien vers la marketplace (optionnel, par défaut true)
 * @param {boolean} options.showUserInfo - Afficher les informations utilisateur (optionnel, par défaut true)
 * @returns {HTMLElement} Élément de la barre de navigation
 */
const createNavbar = (options = {}) => {
  const {
    appName = 'Application',
    appIcon = null,
    menuItems = [],
    containerId = 'navbar-container',
    showHomeLink = true,
    showUserInfo = true
  } = options;
  
  // Créer le conteneur s'il n'existe pas
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.insertBefore(container, document.body.firstChild);
  }
  
  // Créer la navbar
  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  
  // Créer le conteneur de la navbar
  const navbarContainer = document.createElement('div');
  navbarContainer.className = 'container';
  navbar.appendChild(navbarContainer);
  
  // Créer la partie gauche (brand)
  const navbarBrand = document.createElement('div');
  navbarBrand.className = 'd-flex align-items-center';
  
  // Ajouter le lien vers la marketplace
  if (showHomeLink) {
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.className = 'navbar-brand mr-4';
    homeLink.textContent = 'Marketplace';
    navbarBrand.appendChild(homeLink);
    
    // Ajouter un séparateur
    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.className = 'mr-4 text-secondary';
    navbarBrand.appendChild(separator);
  }
  
  // Ajouter le nom de l'application
  const appNameLink = document.createElement('a');
  appNameLink.href = window.location.pathname;
  appNameLink.className = 'navbar-brand';
  
  if (appIcon) {
    const icon = document.createElement('img');
    icon.src = appIcon;
    icon.alt = `${appName} icon`;
    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.marginRight = '8px';
    appNameLink.appendChild(icon);
  }
  
  const appNameText = document.createElement('span');
  appNameText.textContent = appName;
  appNameLink.appendChild(appNameText);
  
  navbarBrand.appendChild(appNameLink);
  navbarContainer.appendChild(navbarBrand);
  
  // Créer la partie droite (menu et user info)
  const navbarRight = document.createElement('div');
  navbarRight.className = 'd-flex align-items-center';
  
  // Ajouter les éléments du menu
  if (menuItems.length > 0) {
    const navbarNav = document.createElement('ul');
    navbarNav.className = 'navbar-nav';
    
    menuItems.forEach(item => {
      const navItem = document.createElement('li');
      navItem.className = 'nav-item';
      
      const navLink = document.createElement('a');
      navLink.href = item.url || '#';
      navLink.className = 'nav-link';
      if (item.active) navLink.classList.add('active');
      navLink.textContent = item.label;
      
      if (item.onClick) {
        navLink.addEventListener('click', (e) => {
          if (!item.url) e.preventDefault();
          item.onClick(e);
        });
      }
      
      navItem.appendChild(navLink);
      navbarNav.appendChild(navItem);
    });
    
    navbarRight.appendChild(navbarNav);
  }
  
  // Ajouter les informations utilisateur
  if (showUserInfo) {
    const userInfo = document.createElement('div');
    userInfo.className = 'ml-4';
    
    if (isAuthenticated()) {
      const user = getUserInfo();
      
      const userDropdown = document.createElement('div');
      userDropdown.className = 'd-flex align-items-center';
      userDropdown.style.position = 'relative';
      userDropdown.style.cursor = 'pointer';
      
      const userName = document.createElement('span');
      userName.textContent = user.name;
      userName.className = 'mr-2';
      userDropdown.appendChild(userName);
      
      const dropdownIcon = document.createElement('span');
      dropdownIcon.innerHTML = '▼';
      dropdownIcon.style.fontSize = '10px';
      userDropdown.appendChild(dropdownIcon);
      
      // Créer le menu déroulant
      const dropdownMenu = document.createElement('div');
      dropdownMenu.className = 'card';
      dropdownMenu.style.position = 'absolute';
      dropdownMenu.style.top = '100%';
      dropdownMenu.style.right = '0';
      dropdownMenu.style.minWidth = '200px';
      dropdownMenu.style.marginTop = '8px';
      dropdownMenu.style.zIndex = '1000';
      dropdownMenu.style.display = 'none';
      
      // Ajouter les éléments du menu déroulant
      const profileLink = document.createElement('a');
      profileLink.href = '/profile';
      profileLink.className = 'p-2';
      profileLink.textContent = 'Mon profil';
      dropdownMenu.appendChild(profileLink);
      
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.className = 'p-2';
      logoutLink.textContent = 'Déconnexion';
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
      dropdownMenu.appendChild(logoutLink);
      
      userDropdown.appendChild(dropdownMenu);
      
      // Gérer l'affichage du menu déroulant
      userDropdown.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
      });
      
      // Fermer le menu déroulant en cliquant ailleurs
      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
          dropdownMenu.style.display = 'none';
        }
      });
      
      userInfo.appendChild(userDropdown);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = '/login';
      loginLink.className = 'btn btn-outline-primary btn-sm mr-2';
      loginLink.textContent = 'Connexion';
      userInfo.appendChild(loginLink);
      
      const registerLink = document.createElement('a');
      registerLink.href = '/register';
      registerLink.className = 'btn btn-primary btn-sm';
      registerLink.textContent = 'Inscription';
      userInfo.appendChild(registerLink);
    }
    
    navbarRight.appendChild(userInfo);
  }
  
  navbarContainer.appendChild(navbarRight);
  container.appendChild(navbar);
  
  return navbar;
};

export { createNavbar };

/**
 * Module de notifications partagé pour les applications tierces
 * Ce module permet aux applications tierces d'utiliser le système de notifications de la marketplace
 * 
 * @module apps/shared/notifications
 * @author Marketplace Team
 * @version 1.0.0
 */

// Styles pour les notifications
const styles = `
.marketplace-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 4px;
  color: white;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  max-width: 350px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideIn 0.3s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.marketplace-notification.success {
  background-color: #4caf50;
}

.marketplace-notification.error {
  background-color: #f44336;
}

.marketplace-notification.info {
  background-color: #2196f3;
}

.marketplace-notification.warning {
  background-color: #ff9800;
}

.marketplace-notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  margin-left: 10px;
  opacity: 0.8;
}

.marketplace-notification-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
`;

// Injecter les styles dans le document
const injectStyles = () => {
  if (!document.getElementById('marketplace-notification-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'marketplace-notification-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
};

// Créer un élément de notification
const createNotificationElement = (message, type, duration) => {
  const notification = document.createElement('div');
  notification.className = `marketplace-notification ${type}`;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'marketplace-notification-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    closeNotification(notification);
  });
  
  notification.appendChild(messageSpan);
  notification.appendChild(closeButton);
  
  document.body.appendChild(notification);
  
  // Fermer automatiquement après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      closeNotification(notification);
    }, duration);
  }
  
  return notification;
};

// Fermer une notification
const closeNotification = (notification) => {
  notification.style.animation = 'slideOut 0.3s ease-in forwards';
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
};

/**
 * Affiche une notification de succès
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes (0 pour ne pas fermer automatiquement)
 * @returns {HTMLElement} Élément de notification créé
 */
const showSuccess = (message, duration = 5000) => {
  injectStyles();
  return createNotificationElement(message, 'success', duration);
};

/**
 * Affiche une notification d'erreur
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes (0 pour ne pas fermer automatiquement)
 * @returns {HTMLElement} Élément de notification créé
 */
const showError = (message, duration = 5000) => {
  injectStyles();
  return createNotificationElement(message, 'error', duration);
};

/**
 * Affiche une notification d'information
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes (0 pour ne pas fermer automatiquement)
 * @returns {HTMLElement} Élément de notification créé
 */
const showInfo = (message, duration = 5000) => {
  injectStyles();
  return createNotificationElement(message, 'info', duration);
};

/**
 * Affiche une notification d'avertissement
 * @param {string} message - Message à afficher
 * @param {number} [duration=5000] - Durée d'affichage en millisecondes (0 pour ne pas fermer automatiquement)
 * @returns {HTMLElement} Élément de notification créé
 */
const showWarning = (message, duration = 5000) => {
  injectStyles();
  return createNotificationElement(message, 'warning', duration);
};

/**
 * Ferme toutes les notifications
 */
const closeAll = () => {
  const notifications = document.querySelectorAll('.marketplace-notification');
  notifications.forEach(notification => {
    closeNotification(notification);
  });
};

export {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  closeAll
};

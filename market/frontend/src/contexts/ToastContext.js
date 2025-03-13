import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Contexte pour gérer les notifications toast dans l'application
 * Fournit des méthodes pour afficher différents types de notifications
 */
const ToastContext = createContext();

/**
 * Hook personnalisé pour utiliser le contexte Toast
 * @returns {Object} Méthodes pour afficher des notifications
 */
export const useToast = () => useContext(ToastContext);

/**
 * Fournisseur du contexte Toast
 * Encapsule l'application avec le système de notification
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur du contexte Toast
 */
export const ToastProvider = ({ children }) => {
  // État pour gérer les notifications
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'info', 'warning', 'error'
    duration: 6000
  });

  /**
   * Affiche une notification toast
   * @param {string} message - Message à afficher
   * @param {string} severity - Type de notification ('success', 'info', 'warning', 'error')
   * @param {number} duration - Durée d'affichage en millisecondes
   */
  const showToast = (message, severity = 'info', duration = 6000) => {
    setToast({
      open: true,
      message,
      severity,
      duration
    });
  };

  /**
   * Ferme la notification toast
   */
  const hideToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Fonctions utilitaires pour les différents types de notifications
  const success = (message, duration) => showToast(message, 'success', duration);
  const info = (message, duration) => showToast(message, 'info', duration);
  const warning = (message, duration) => showToast(message, 'warning', duration);
  const error = (message, duration) => showToast(message, 'error', duration);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, info, warning, error }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideToast} 
          severity={toast.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export default ToastContext;

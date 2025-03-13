import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant ScrollToTop qui fait défiler la page vers le haut lors des changements de route
 * Ce composant n'a pas de rendu visuel, il effectue simplement une action lors des changements de route
 * 
 * @returns {null} Ce composant ne rend rien
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Faire défiler la page vers le haut lors des changements de route
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Défilement fluide pour une meilleure expérience utilisateur
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

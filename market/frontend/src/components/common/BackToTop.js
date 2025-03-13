import React, { useState, useEffect } from 'react';
import { Fab, Zoom, useScrollTrigger } from '@mui/material';
import { KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';

/**
 * Composant BackToTop qui affiche un bouton flottant permettant de remonter en haut de la page
 * Le bouton apparaît uniquement lorsque l'utilisateur a fait défiler la page vers le bas
 * 
 * @param {Object} props - Propriétés du composant
 * @param {number} props.threshold - Seuil de défilement à partir duquel le bouton apparaît (en pixels)
 * @param {Object} props.sx - Styles personnalisés pour le bouton
 * @returns {JSX.Element} Bouton flottant pour remonter en haut de la page
 */
const BackToTop = ({ threshold = 100, sx = {} }) => {
  // État pour suivre si le bouton doit être affiché
  const [showButton, setShowButton] = useState(false);
  
  // Utiliser useScrollTrigger pour détecter le défilement
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: threshold,
  });
  
  // Mettre à jour l'état en fonction du défilement
  useEffect(() => {
    setShowButton(trigger);
  }, [trigger]);
  
  /**
   * Fonction pour faire défiler la page vers le haut
   */
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <Zoom in={showButton}>
      <Fab
        color="primary"
        size="small"
        aria-label="Retour en haut"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          ...sx
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default BackToTop;

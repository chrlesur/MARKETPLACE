import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@mui/material';

/**
 * Composant LoadingButton qui étend le Button de Material UI
 * en ajoutant un indicateur de chargement et en désactivant le bouton pendant le chargement
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.loading - Indique si le bouton est en état de chargement
 * @param {string} props.loadingText - Texte à afficher pendant le chargement (optionnel)
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {Function} props.onClick - Fonction à exécuter lors du clic
 * @param {string} props.variant - Variante du bouton ('contained', 'outlined', 'text')
 * @param {string} props.color - Couleur du bouton ('primary', 'secondary', 'error', etc.)
 * @param {Object} props.sx - Styles personnalisés
 * @param {Object} props.rest - Autres propriétés à passer au bouton
 * @returns {JSX.Element} Bouton avec indicateur de chargement
 */
const LoadingButton = ({ 
  loading = false, 
  loadingText, 
  children, 
  onClick, 
  variant = 'contained', 
  color = 'primary',
  sx = {},
  ...rest 
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      disabled={loading}
      onClick={onClick}
      sx={{ 
        position: 'relative',
        ...sx 
      }}
      {...rest}
    >
      {loading ? (
        <>
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              left: '50%',
              marginLeft: '-12px'
            }}
          />
          <span style={{ visibility: 'hidden' }}>{children}</span>
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning', 'inherit']),
  sx: PropTypes.object
};

export default LoadingButton;

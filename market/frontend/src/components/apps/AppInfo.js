import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Rating,
  Button,
  Alert
} from '@mui/material';
import { Download as DownloadIcon, Launch as LaunchIcon, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import du contexte d'authentification
import { useAuth } from '../../contexts/AuthContext';

/**
 * Composant pour afficher les informations principales d'une application
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.app - Données de l'application
 * @param {Function} props.handleDownload - Fonction pour gérer le téléchargement
 * @returns {JSX.Element} Composant AppInfo
 */
const AppInfo = ({ app, handleDownload }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  if (!app) return null;
  
  // Fonction pour rediriger vers la page de connexion
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        {app.name}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          Par {app.developer?.name || 'Développeur non spécifié'}
        </Typography>
        
        {app.category && (
          <Chip
            label={app.category.name}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Rating
          value={app.averageRating || 0}
          precision={0.1}
          readOnly
          size="small"
        />
        <Typography variant="body2" sx={{ ml: 1 }}>
          {app.averageRating ? app.averageRating.toFixed(1) : 'N/A'} ({app.ratings?.length || 0} avis)
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        {app.description?.short || app.description?.full || app.description || 'Aucune description disponible'}
      </Typography>
      
      {/* Vérifier si l'utilisateur est connecté */}
      {!isLoggedIn() && app.pricing?.type === 'free' ? (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Vous devez être connecté pour accéder à cette application.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={handleLoginRedirect}
            sx={{ mb: 3 }}
          >
            Se connecter
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={app.pricing?.type === 'free' ? <LaunchIcon /> : <DownloadIcon />}
          onClick={handleDownload}
          sx={{ mb: 3 }}
        >
          {app.pricing?.type === 'free' ? 'Accéder à l\'application' :
           app.pricing?.type === 'paid' ? `Acheter (${app.pricing.price || 0} ${app.pricing.currency || '€'})` : 
           app.pricing?.type === 'subscription' ? `S'abonner (${app.pricing.price || 0} ${app.pricing.currency || '€'}/mois)` : 
           'Télécharger'}
        </Button>
      )}
      
      {/* Informations supplémentaires */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Version
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {app.version || 'Non spécifiée'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Dernière mise à jour
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'Non spécifiée'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Téléchargements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {app.downloads || 0}
        </Typography>
      </Box>
      
      {/* Tags */}
      {app.tags && app.tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
          {app.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AppInfo;

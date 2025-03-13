import React from 'react';
import PropTypes from 'prop-types';
import { Box, Skeleton, Grid, Card, CardContent, CardHeader } from '@mui/material';

/**
 * Composant SkeletonLoader qui fournit différents types de loaders squelettes
 * pour améliorer l'expérience utilisateur pendant le chargement des données
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.type - Type de loader ('card', 'list', 'detail', 'text', 'table')
 * @param {number} props.count - Nombre d'éléments à afficher (pour les types 'card' et 'list')
 * @param {Object} props.height - Hauteur personnalisée pour certains éléments
 * @param {Object} props.width - Largeur personnalisée pour certains éléments
 * @returns {JSX.Element} Loader squelette approprié
 */
const SkeletonLoader = ({ type = 'text', count = 3, height, width }) => {
  // Loader pour les cartes (applications, catégories, etc.)
  const renderCardSkeleton = () => {
    return (
      <Grid container spacing={3}>
        {Array(count).fill(0).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <Skeleton 
                variant="rectangular" 
                height={height || 140} 
                sx={{ borderRadius: '4px 4px 0 0' }} 
              />
              <CardContent>
                <Skeleton variant="text" height={28} width="80%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} width="60%" />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="20%" height={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Loader pour les listes (applications, utilisateurs, etc.)
  const renderListSkeleton = () => {
    return (
      <Box>
        {Array(count).fill(0).map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" height={24} width="60%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={16} width="40%" />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width={60} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={60} height={36} sx={{ borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Loader pour les détails (page de détail d'application, profil, etc.)
  const renderDetailSkeleton = () => {
    return (
      <Grid container spacing={4}>
        {/* Image principale */}
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" width="100%" height={height || 400} sx={{ borderRadius: 2 }} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" width={80} height={60} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Grid>
        
        {/* Informations */}
        <Grid item xs={12} md={6}>
          <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={100} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1, mb: 2 }} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={30} sx={{ mb: 1 }} />
        </Grid>
        
        {/* Onglets */}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1, mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>
    );
  };

  // Loader pour le texte (paragraphes, descriptions, etc.)
  const renderTextSkeleton = () => {
    return (
      <Box>
        <Skeleton variant="text" height={40} width="70%" sx={{ mb: 1 }} />
        {Array(count).fill(0).map((_, index) => (
          <Skeleton key={index} variant="text" height={20} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  };

  // Loader pour les tableaux (liste d'applications, utilisateurs, etc.)
  const renderTableSkeleton = () => {
    return (
      <Box>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 1, borderRadius: 1 }} />
        {Array(count).fill(0).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular" 
            height={52} 
            sx={{ 
              mb: 1, 
              borderRadius: 1,
              opacity: 1 - (index * 0.1) // Effet de fondu pour les lignes plus éloignées
            }} 
          />
        ))}
      </Box>
    );
  };

  // Sélectionner le type de loader à afficher
  switch (type) {
    case 'card':
      return renderCardSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'detail':
      return renderDetailSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'text':
    default:
      return renderTextSkeleton();
  }
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['card', 'list', 'detail', 'text', 'table']),
  count: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default SkeletonLoader;

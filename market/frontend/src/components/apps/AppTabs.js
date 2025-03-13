import React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import TabPanel from '../common/TabPanel';
import RatingForm from './RatingForm';
import RatingsList from './RatingsList';
import { useNavigate } from 'react-router-dom';

/**
 * Composant pour les onglets d'information détaillée d'une application
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.app - Données de l'application
 * @param {number} props.tabValue - Valeur de l'onglet actif
 * @param {Function} props.handleTabChange - Fonction pour changer d'onglet
 * @param {Object} props.ratingProps - Propriétés pour le formulaire d'évaluation
 * @param {boolean} props.isLoggedIn - Indique si l'utilisateur est connecté
 * @returns {JSX.Element} Composant AppTabs
 */
const AppTabs = ({ 
  app, 
  tabValue, 
  handleTabChange, 
  ratingProps,
  isLoggedIn
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  if (!app) return null;

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="app tabs"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
        >
          <Tab label="Description" id="app-tab-0" aria-controls="app-tabpanel-0" />
          <Tab label="Évaluations" id="app-tab-1" aria-controls="app-tabpanel-1" />
          <Tab label="Informations" id="app-tab-2" aria-controls="app-tabpanel-2" />
        </Tabs>
      </Box>
      
      {/* Onglet Description */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          À propos de cette application
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {app.description?.full || app.description?.short || app.description || 'Aucune description détaillée disponible.'}
        </Typography>
      </TabPanel>
      
      {/* Onglet Évaluations */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={4}>
          {/* Formulaire d'évaluation */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Votre évaluation
            </Typography>
            
            {isLoggedIn ? (
              <RatingForm {...ratingProps} />
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Connectez-vous pour laisser une évaluation
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login', { state: { from: `/apps/${app._id || app.id}` } })}
                >
                  Se connecter
                </Button>
              </Box>
            )}
          </Grid>
          
          {/* Liste des évaluations */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Évaluations des utilisateurs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {app.ratings?.length || 0} avis
              </Typography>
            </Box>
            
            <RatingsList ratings={app.ratings || []} />
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Onglet Informations */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Informations sur le développeur
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Nom
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {app.developer?.name || 'Non spécifié'}
              </Typography>
            </Box>
            
            {app.developer?.website && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Site web
                </Typography>
                <Typography variant="body2">
                  <a href={app.developer.website} target="_blank" rel="noopener noreferrer">
                    {app.developer.website}
                  </a>
                </Typography>
              </Box>
            )}
            
            {app.developer?.email && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Email
                </Typography>
                <Typography variant="body2">
                  <a href={`mailto:${app.developer.email}`}>
                    {app.developer.email}
                  </a>
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Informations techniques
            </Typography>
            
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
                Date de création
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Non spécifiée'}
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
            
            {app.requirements && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Configuration requise
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {app.requirements}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </TabPanel>
    </>
  );
};

export default AppTabs;

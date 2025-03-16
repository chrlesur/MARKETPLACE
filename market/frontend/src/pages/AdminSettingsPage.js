import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Contexte pour les notifications
import { useToast } from '../contexts/ToastContext';

// Service pour les paramètres
import { getSettings, updateSettings, resetSettings } from '../services/settings.service';

/**
 * Page des paramètres d'administration
 */
const AdminSettingsPage = () => {
  // Contexte pour les notifications
  const { showToast } = useToast();
  
  // État pour les paramètres du site
  const [settings, setSettings] = useState({
    siteName: 'Marketplace Web',
    siteDescription: 'Découvrez des applications web innovantes',
    contactEmail: 'contact@marketplace.example.com',
    apiKey: '••••••••••••••••',
    enableRegistration: true,
    enableNotifications: true,
    maintenanceMode: false,
    analyticsId: 'UA-XXXXXXXXX-X',
    enableAnalytics: true,
    collectUserData: true,
    showStatsToUsers: false,
    dataRetentionPeriod: 365
  });
  
  // État pour le chargement
  const [loading, setLoading] = useState(true);
  
  // État pour afficher/masquer l'API key
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Charger les paramètres depuis l'API au chargement du composant
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        showToast('Erreur lors du chargement des paramètres', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [showToast]);
  
  // Gérer les changements dans les champs de texte
  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings({
      ...settings,
      [name]: event.target.type === 'checkbox' ? checked : value
    });
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // Envoyer les paramètres à l'API
      await updateSettings(settings);
      showToast('Paramètres enregistrés avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      showToast('Erreur lors de la mise à jour des paramètres', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Réinitialiser les paramètres
  const handleReset = async () => {
    setLoading(true);
    
    try {
      // Réinitialiser les paramètres via l'API
      const data = await resetSettings();
      setSettings(data);
      showToast('Paramètres réinitialisés avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des paramètres:', error);
      showToast('Erreur lors de la réinitialisation des paramètres', 'error');
      
      // Fallback en cas d'erreur
      setSettings({
        siteName: 'Marketplace Web',
        siteDescription: 'Découvrez des applications web innovantes',
        contactEmail: 'contact@marketplace.example.com',
        apiKey: '••••••••••••••••',
        enableRegistration: true,
        enableNotifications: true,
        maintenanceMode: false,
        analyticsId: 'UA-XXXXXXXXX-X',
        enableAnalytics: true,
        collectUserData: true,
        showStatsToUsers: false,
        dataRetentionPeriod: 365
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Afficher un indicateur de chargement pendant le chargement initial
  if (loading && !settings.siteName) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configurez les paramètres généraux de la plateforme.
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Paramètres généraux */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Paramètres généraux" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom du site"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description du site"
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email de contact"
                      name="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Paramètres API */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Paramètres API" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Clé API"
                      name="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.apiKey}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowApiKey(!showApiKey)}
                              edge="end"
                            >
                              {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ID Google Analytics"
                      name="analyticsId"
                      value={settings.analyticsId}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Paramètres de fonctionnalités */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardHeader title="Fonctionnalités" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableRegistration}
                          onChange={handleChange}
                          name="enableRegistration"
                          color="primary"
                        />
                      }
                      label="Inscription utilisateurs"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableNotifications}
                          onChange={handleChange}
                          name="enableNotifications"
                          color="primary"
                        />
                      }
                      label="Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={handleChange}
                          name="maintenanceMode"
                          color="warning"
                        />
                      }
                      label="Mode maintenance"
                    />
                  </Grid>
                </Grid>
                
                {settings.maintenanceMode && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Le mode maintenance est activé. Seuls les administrateurs pourront accéder au site.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Statistiques d'utilisation */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardHeader title="Statistiques d'utilisation" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Configurez les paramètres de collecte et d'affichage des statistiques d'utilisation de la plateforme.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableAnalytics || true}
                          onChange={handleChange}
                          name="enableAnalytics"
                          color="primary"
                        />
                      }
                      label="Activer les statistiques"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.collectUserData || true}
                          onChange={handleChange}
                          name="collectUserData"
                          color="primary"
                        />
                      }
                      label="Collecter données utilisateurs"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showStatsToUsers || false}
                          onChange={handleChange}
                          name="showStatsToUsers"
                          color="primary"
                        />
                      }
                      label="Afficher aux utilisateurs"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Période de rétention des données (jours)"
                    name="dataRetentionPeriod"
                    type="number"
                    value={settings.dataRetentionPeriod || 365}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 30, max: 3650 } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Réinitialiser
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            Enregistrer
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminSettingsPage;

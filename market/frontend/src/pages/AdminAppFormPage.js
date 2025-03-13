import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// Importer les services
import { getAppById, createApp, updateApp } from '../services/apps.service';
import { getCategories } from '../services/categories.service';

/**
 * Page de formulaire d'application
 * 
 * Cette page permet de créer ou modifier une application :
 * - Formulaire avec validation
 * - Chargement des données depuis l'API en mode édition
 * - Soumission des données vers l'API
 */
const AdminAppFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: {
      short: '',
      full: ''
    },
    developer: {
      name: '',
      website: '',
      email: ''
    },
    category: '',
    tags: '',
    images: {
      icon: '',
      screenshots: ['', '', '']
    },
    pricing: {
      type: 'free',
      price: 0
    },
    url: '',
    apiEndpoint: '',
    version: '',
    requirements: {
      browser: '',
      api: ''
    },
    isActive: true,
    isFeatured: false
  });
  
  // Erreurs de validation
  const [errors, setErrors] = useState({});
  
  /**
   * Charge les catégories et les données de l'application en mode édition
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les catégories
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
        
        // Si en mode édition, charger les données de l'application
        if (isEditMode) {
          const app = await getAppById(id);
          
          if (app) {
            // Formater les données pour le formulaire
            setFormData({
              ...app,
              tags: Array.isArray(app.tags) ? app.tags.join(', ') : app.tags,
              requirements: {
                browser: Array.isArray(app.requirements?.browser) 
                  ? app.requirements.browser.join(', ') 
                  : app.requirements?.browser || '',
                api: Array.isArray(app.requirements?.api) 
                  ? app.requirements.api.join(', ') 
                  : app.requirements?.api || ''
              }
            });
          } else {
            // Application non trouvée
            setSnackbar({
              open: true,
              message: 'Application non trouvée',
              severity: 'error'
            });
            navigate('/admin/apps');
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode, navigate]);
  
  /**
   * Gestion des changements dans le formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  /**
   * Gestion des changements pour les switches
   */
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  /**
   * Gestion des changements pour les screenshots
   */
  const handleScreenshotChange = (index, value) => {
    const newScreenshots = [...formData.images.screenshots];
    newScreenshots[index] = value;
    
    setFormData({
      ...formData,
      images: {
        ...formData.images,
        screenshots: newScreenshots
      }
    });
  };
  
  /**
   * Génération automatique du slug à partir du nom
   */
  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    setFormData({
      ...formData,
      slug
    });
  };
  
  /**
   * Validation du formulaire
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs requis
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.slug) newErrors.slug = 'Le slug est requis';
    if (!formData.description.short) newErrors['description.short'] = 'La description courte est requise';
    if (!formData.description.full) newErrors['description.full'] = 'La description complète est requise';
    if (!formData.developer.name) newErrors['developer.name'] = 'Le nom du développeur est requis';
    if (!formData.category) newErrors.category = 'La catégorie est requise';
    if (!formData.images.icon) newErrors['images.icon'] = 'L\'icône est requise';
    if (!formData.url) newErrors.url = 'L\'URL est requise';
    
    // Validation des emails
    if (formData.developer.email && !/^\S+@\S+\.\S+$/.test(formData.developer.email)) {
      newErrors['developer.email'] = 'Email invalide';
    }
    
    // Validation des URLs
    if (formData.developer.website && !/^https?:\/\/\S+\.\S+/.test(formData.developer.website)) {
      newErrors['developer.website'] = 'URL invalide';
    }
    
    if (formData.url && !/^\/\S+/.test(formData.url)) {
      newErrors.url = 'L\'URL doit commencer par /';
    }
    
    if (formData.apiEndpoint && !/^\/\S+/.test(formData.apiEndpoint)) {
      newErrors.apiEndpoint = 'L\'URL de l\'API doit commencer par /';
    }
    
    // Validation du prix
    if (formData.pricing.type !== 'free' && (!formData.pricing.price || formData.pricing.price <= 0)) {
      newErrors['pricing.price'] = 'Le prix doit être supérieur à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Préparation des données pour l'API
   */
  const prepareDataForApi = () => {
    // Convertir les tags en tableau
    const tags = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim())
      : [];
    
    // Convertir les requirements en tableaux
    const browser = formData.requirements.browser
      ? formData.requirements.browser.split(',').map(item => item.trim())
      : [];
    
    const api = formData.requirements.api
      ? formData.requirements.api.split(',').map(item => item.trim())
      : [];
    
    // Retourner les données formatées
    return {
      ...formData,
      tags,
      requirements: {
        browser,
        api
      }
    };
  };
  
  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs dans le formulaire',
        severity: 'error'
      });
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Préparer les données pour l'API
      const appData = prepareDataForApi();
      
      // Créer ou mettre à jour l'application
      if (isEditMode) {
        await updateApp(id, appData);
        setSnackbar({
          open: true,
          message: 'Application mise à jour avec succès',
          severity: 'success'
        });
      } else {
        await createApp(appData);
        setSnackbar({
          open: true,
          message: 'Application créée avec succès',
          severity: 'success'
        });
      }
      
      // Rediriger vers la liste des applications après un court délai
      setTimeout(() => {
        navigate('/admin/apps');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de l\'enregistrement',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Fermeture du snackbar
   */
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {isEditMode ? 'Modifier l\'application' : 'Ajouter une application'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/apps')}
          >
            Retour
          </Button>
        </Box>
        
        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Informations de base */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Informations de base
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={() => !formData.slug && generateSlug()}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        error={!!errors.slug}
                        helperText={errors.slug || 'Identifiant unique pour l\'URL'}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description courte"
                        name="description.short"
                        value={formData.description.short}
                        onChange={handleChange}
                        error={!!errors['description.short']}
                        helperText={errors['description.short']}
                        required
                        inputProps={{ maxLength: 150 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description complète"
                        name="description.full"
                        value={formData.description.full}
                        onChange={handleChange}
                        error={!!errors['description.full']}
                        helperText={errors['description.full']}
                        required
                        multiline
                        rows={4}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        helperText="Séparez les tags par des virgules"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required error={!!errors.category}>
                        <InputLabel>Catégorie</InputLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          label="Catégorie"
                        >
                          {categories.map(category => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Informations sur le développeur */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Informations sur le développeur
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Nom du développeur"
                        name="developer.name"
                        value={formData.developer.name}
                        onChange={handleChange}
                        error={!!errors['developer.name']}
                        helperText={errors['developer.name']}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Site web"
                        name="developer.website"
                        value={formData.developer.website}
                        onChange={handleChange}
                        error={!!errors['developer.website']}
                        helperText={errors['developer.website']}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="developer.email"
                        value={formData.developer.email}
                        onChange={handleChange}
                        error={!!errors['developer.email']}
                        helperText={errors['developer.email']}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Images */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Images
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="URL de l'icône"
                        name="images.icon"
                        value={formData.images.icon}
                        onChange={handleChange}
                        error={!!errors['images.icon']}
                        helperText={errors['images.icon']}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Captures d'écran
                      </Typography>
                    </Grid>
                    {formData.images.screenshots.map((screenshot, index) => (
                      <Grid item xs={12} key={index}>
                        <TextField
                          fullWidth
                          label={`Capture d'écran ${index + 1}`}
                          value={screenshot}
                          onChange={(e) => handleScreenshotChange(index, e.target.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Tarification */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Tarification
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type de tarification</InputLabel>
                        <Select
                          name="pricing.type"
                          value={formData.pricing.type}
                          onChange={handleChange}
                          label="Type de tarification"
                        >
                          <MenuItem value="free">Gratuit</MenuItem>
                          <MenuItem value="paid">Payant</MenuItem>
                          <MenuItem value="subscription">Abonnement</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Prix"
                        name="pricing.price"
                        type="number"
                        value={formData.pricing.price}
                        onChange={handleChange}
                        disabled={formData.pricing.type === 'free'}
                        error={!!errors['pricing.price']}
                        helperText={errors['pricing.price']}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">€</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Informations techniques */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Informations techniques
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="URL de l'application"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        error={!!errors.url}
                        helperText={errors.url || 'Ex: /apps/nom-app'}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="URL de l'API"
                        name="apiEndpoint"
                        value={formData.apiEndpoint}
                        onChange={handleChange}
                        error={!!errors.apiEndpoint}
                        helperText={errors.apiEndpoint || 'Ex: /api/nom-app'}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Version"
                        name="version"
                        value={formData.version}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Navigateurs supportés"
                        name="requirements.browser"
                        value={formData.requirements.browser}
                        onChange={handleChange}
                        helperText="Séparez par des virgules"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="API requises"
                        name="requirements.api"
                        value={formData.requirements.api}
                        onChange={handleChange}
                        helperText="Séparez par des virgules"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Paramètres */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Paramètres
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleSwitchChange}
                            name="isActive"
                            color="primary"
                          />
                        }
                        label="Application active"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isFeatured}
                            onChange={handleSwitchChange}
                            name="isFeatured"
                            color="primary"
                          />
                        }
                        label="Application vedette"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Boutons d'action */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/apps')}
                >
                  Annuler
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={saving}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                >
                  {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </form>
        
        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminAppFormPage;
